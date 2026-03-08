import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let targetTenantId: string | null = null;
    try {
      const body = await req.json();
      targetTenantId = body?.tenant_id || null;
    } catch {
      // No body = cron trigger
    }

    let tenantsQuery = supabase.from('tenants').select('id, name');
    if (targetTenantId) {
      tenantsQuery = tenantsQuery.eq('id', targetTenantId);
    }
    const { data: tenants, error: tenantError } = await tenantsQuery;

    if (tenantError) throw tenantError;

    console.log(`Processing ${tenants?.length || 0} tenants`);

    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    monday.setHours(0, 0, 0, 0);
    
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);
    friday.setHours(23, 59, 59, 999);

    const periodStart = monday.toISOString().split('T')[0];
    const periodEnd = friday.toISOString().split('T')[0];

    // Previous week for trends
    const prevMonday = new Date(monday);
    prevMonday.setDate(monday.getDate() - 7);
    const prevFriday = new Date(friday);
    prevFriday.setDate(friday.getDate() - 7);
    const prevPeriodStart = prevMonday.toISOString().split('T')[0];
    const prevPeriodEnd = prevFriday.toISOString().split('T')[0];

    const results = [];

    for (const tenant of tenants || []) {
      console.log(`Generating report for tenant: ${tenant.name} (${tenant.id})`);

      try {
        // ===== CURRENT WEEK METRICS =====
        
        // 1. HR Summary
        const { count: totalHeadcount } = await supabase
          .from('employee_profiles')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenant.id)
          .eq('status', 'active');

        const { data: newHiresList } = await supabase
          .from('employee_profiles')
          .select('first_name, last_name, department, position, hire_date')
          .eq('tenant_id', tenant.id)
          .gte('hire_date', periodStart)
          .lte('hire_date', periodEnd);
        const newHires = newHiresList?.length || 0;

        const { count: terminations } = await supabase
          .from('employee_profiles')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenant.id)
          .eq('status', 'inactive')
          .gte('updated_at', periodStart);

        const { count: activeClearances } = await supabase
          .from('offboarding_clearance')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenant.id)
          .in('status', ['initiated', 'in_progress']);

        // Expiring contracts (next 30 days)
        const thirtyDaysOut = new Date(now);
        thirtyDaysOut.setDate(now.getDate() + 30);
        const { data: expiringContracts } = await supabase
          .from('employee_profiles')
          .select('first_name, last_name, department, position, contract_end_date')
          .eq('tenant_id', tenant.id)
          .eq('status', 'active')
          .not('contract_end_date', 'is', null)
          .lte('contract_end_date', thirtyDaysOut.toISOString().split('T')[0])
          .gte('contract_end_date', now.toISOString().split('T')[0]);

        // 2. Leave metrics
        const { count: leaveSubmitted } = await supabase
          .from('leave_requests')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenant.id)
          .gte('created_at', periodStart)
          .lte('created_at', periodEnd + 'T23:59:59');

        const { count: leaveApproved } = await supabase
          .from('leave_requests')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenant.id)
          .eq('status', 'approved')
          .gte('updated_at', periodStart);

        const { count: leaveRejected } = await supabase
          .from('leave_requests')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenant.id)
          .eq('status', 'rejected')
          .gte('updated_at', periodStart);

        const { count: leavePending } = await supabase
          .from('leave_requests')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenant.id)
          .eq('status', 'pending');

        // Approved leaves with details for breakdown
        const { data: approvedLeaves } = await supabase
          .from('leave_requests')
          .select('employee_id, leave_type, days_requested, start_date, end_date')
          .eq('tenant_id', tenant.id)
          .eq('status', 'approved')
          .gte('start_date', periodStart)
          .lte('start_date', periodEnd);

        const totalLeaveDays = approvedLeaves?.reduce((sum, l) => sum + (l.days_requested || 0), 0) || 0;

        // Leave breakdown by type
        const leaveByType: Record<string, { count: number; days: number }> = {};
        for (const leave of approvedLeaves || []) {
          const type = leave.leave_type || 'Other';
          if (!leaveByType[type]) leaveByType[type] = { count: 0, days: 0 };
          leaveByType[type].count++;
          leaveByType[type].days += leave.days_requested || 0;
        }

        // Employees currently on leave (overlap with this week)
        const { data: onLeaveNow } = await supabase
          .from('leave_requests')
          .select('employee_id, leave_type, start_date, end_date, days_requested')
          .eq('tenant_id', tenant.id)
          .eq('status', 'approved')
          .lte('start_date', periodEnd)
          .gte('end_date', periodStart);

        // Enrich on-leave employees with names
        const onLeaveDetails = [];
        for (const leave of onLeaveNow || []) {
          const { data: profile } = await supabase
            .from('employee_profiles')
            .select('first_name, last_name, department')
            .eq('profile_id', leave.employee_id)
            .maybeSingle();
          
          if (!profile) {
            const { data: profileById } = await supabase
              .from('employee_profiles')
              .select('first_name, last_name, department')
              .eq('id', leave.employee_id)
              .maybeSingle();
            
            onLeaveDetails.push({
              name: profileById ? `${profileById.first_name} ${profileById.last_name}` : 'Unknown',
              department: profileById?.department || 'N/A',
              leave_type: leave.leave_type,
              start_date: leave.start_date,
              end_date: leave.end_date,
              days: leave.days_requested,
            });
          } else {
            onLeaveDetails.push({
              name: `${profile.first_name} ${profile.last_name}`,
              department: profile.department || 'N/A',
              leave_type: leave.leave_type,
              start_date: leave.start_date,
              end_date: leave.end_date,
              days: leave.days_requested,
            });
          }
        }

        // 3. Performance
        const { count: evalsCompleted } = await supabase
          .from('evaluations')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenant.id)
          .eq('status', 'completed')
          .gte('updated_at', periodStart);

        const { count: evalsPending } = await supabase
          .from('evaluations')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenant.id)
          .in('status', ['draft', 'pending']);

        // Active PIPs with employee names
        const { data: pipData } = await supabase
          .from('performance_improvement_plans')
          .select('employee_id, status, start_date, end_date')
          .eq('tenant_id', tenant.id)
          .eq('status', 'active');

        const pipDetails = [];
        for (const pip of pipData || []) {
          const { data: empProfile } = await supabase
            .from('employee_profiles')
            .select('first_name, last_name, department')
            .eq('id', pip.employee_id)
            .maybeSingle();
          pipDetails.push({
            name: empProfile ? `${empProfile.first_name} ${empProfile.last_name}` : 'Unknown',
            department: empProfile?.department || 'N/A',
            start_date: pip.start_date,
            end_date: pip.end_date,
          });
        }

        // 4. Tickets
        const { count: ticketsOpened } = await supabase
          .from('tickets')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenant.id)
          .gte('created_at', periodStart);

        const { count: ticketsResolved } = await supabase
          .from('tickets')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenant.id)
          .eq('status', 'resolved')
          .gte('updated_at', periodStart);

        const { count: ticketsPending } = await supabase
          .from('tickets')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenant.id)
          .in('status', ['open', 'in_progress']);

        // 5. Recruitment
        const { count: openPositions } = await supabase
          .from('job_listings')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenant.id)
          .eq('status', 'open');

        const { count: newApplications } = await supabase
          .from('job_applications')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenant.id)
          .gte('applied_at', periodStart);

        const { count: interviewsScheduled } = await supabase
          .from('interviews')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenant.id)
          .gte('interview_date', periodStart)
          .lte('interview_date', periodEnd);

        // ===== PREVIOUS WEEK METRICS (for trends) =====
        const { count: prevHeadcount } = await supabase
          .from('employee_profiles')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenant.id)
          .eq('status', 'active')
          .lte('hire_date', prevPeriodEnd);

        const { count: prevLeaveSubmitted } = await supabase
          .from('leave_requests')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenant.id)
          .gte('created_at', prevPeriodStart)
          .lte('created_at', prevPeriodEnd + 'T23:59:59');

        const { data: prevApprovedLeaves } = await supabase
          .from('leave_requests')
          .select('days_requested')
          .eq('tenant_id', tenant.id)
          .eq('status', 'approved')
          .gte('start_date', prevPeriodStart)
          .lte('start_date', prevPeriodEnd);
        const prevTotalLeaveDays = prevApprovedLeaves?.reduce((sum, l) => sum + (l.days_requested || 0), 0) || 0;

        const { count: prevTicketsOpened } = await supabase
          .from('tickets')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenant.id)
          .gte('created_at', prevPeriodStart)
          .lte('created_at', prevPeriodEnd + 'T23:59:59');

        const { count: prevNewApplications } = await supabase
          .from('job_applications')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenant.id)
          .gte('applied_at', prevPeriodStart)
          .lte('applied_at', prevPeriodEnd + 'T23:59:59');

        // Build trend comparisons
        const trends = {
          headcount: { current: totalHeadcount || 0, previous: prevHeadcount || 0 },
          leaveSubmitted: { current: leaveSubmitted || 0, previous: prevLeaveSubmitted || 0 },
          leaveDays: { current: totalLeaveDays, previous: prevTotalLeaveDays },
          tickets: { current: ticketsOpened || 0, previous: prevTicketsOpened || 0 },
          applications: { current: newApplications || 0, previous: prevNewApplications || 0 },
        };

        // Build detailed report_data
        const reportData = {
          hr: {
            totalHeadcount: totalHeadcount || 0,
            newHires: newHires,
            newHiresList: newHiresList || [],
            terminations: terminations || 0,
            activeClearances: activeClearances || 0,
            expiringContracts: expiringContracts || [],
          },
          leave: {
            submitted: leaveSubmitted || 0,
            approved: leaveApproved || 0,
            rejected: leaveRejected || 0,
            pending: leavePending || 0,
            totalDays: totalLeaveDays,
            byType: leaveByType,
            onLeaveThisWeek: onLeaveDetails,
          },
          performance: {
            completed: evalsCompleted || 0,
            pending: evalsPending || 0,
            activePips: pipData?.length || 0,
            pipDetails: pipDetails,
          },
          tickets: {
            opened: ticketsOpened || 0,
            resolved: ticketsResolved || 0,
            pending: ticketsPending || 0,
          },
          recruitment: {
            openPositions: openPositions || 0,
            newApplications: newApplications || 0,
            interviews: interviewsScheduled || 0,
          },
          trends,
        };

        // Build summary text
        const reportSummary = `Weekly HR Report for ${tenant.name} (${periodStart} to ${periodEnd})

HR OVERVIEW:
• Total Active Staff: ${totalHeadcount || 0}
• New Hires This Week: ${newHires}${newHiresList?.map(h => `\n  - ${h.first_name} ${h.last_name} (${h.department}, ${h.position})`).join('') || ''}
• Terminations: ${terminations || 0}
• Active Clearances: ${activeClearances || 0}
• Contracts Expiring (30 days): ${expiringContracts?.length || 0}${expiringContracts?.map(c => `\n  - ${c.first_name} ${c.last_name} (${c.department}) — expires ${c.contract_end_date}`).join('') || ''}

LEAVE & ATTENDANCE:
• Submitted: ${leaveSubmitted || 0} | Approved: ${leaveApproved || 0} | Rejected: ${leaveRejected || 0} | Pending: ${leavePending || 0}
• Total Leave Days: ${totalLeaveDays}
• By Type: ${Object.entries(leaveByType).map(([t, v]) => `${t}: ${v.days} days (${v.count} requests)`).join(', ') || 'None'}
• Employees On Leave This Week: ${onLeaveDetails.length}${onLeaveDetails.map(e => `\n  - ${e.name} (${e.department}) — ${e.leave_type}, ${e.start_date} to ${e.end_date}`).join('') || ''}

PERFORMANCE:
• Evaluations Completed: ${evalsCompleted || 0} | Pending: ${evalsPending || 0}
• Active PIPs: ${pipData?.length || 0}${pipDetails.map(p => `\n  - ${p.name} (${p.department}) — ${p.start_date} to ${p.end_date}`).join('') || ''}

SUPPORT TICKETS:
• New: ${ticketsOpened || 0} | Resolved: ${ticketsResolved || 0} | Pending: ${ticketsPending || 0}

RECRUITMENT:
• Open Positions: ${openPositions || 0} | New Applications: ${newApplications || 0} | Interviews: ${interviewsScheduled || 0}

WEEK-OVER-WEEK TRENDS:
• Headcount: ${trends.headcount.current} (prev: ${trends.headcount.previous})
• Leave Requests: ${trends.leaveSubmitted.current} (prev: ${trends.leaveSubmitted.previous})
• Leave Days: ${trends.leaveDays.current} (prev: ${trends.leaveDays.previous})
• Tickets: ${trends.tickets.current} (prev: ${trends.tickets.previous})
• Applications: ${trends.applications.current} (prev: ${trends.applications.previous})`;

        // Insert report
        const { data: report, error: insertError } = await supabase
          .from('weekly_management_reports')
          .insert({
            tenant_id: tenant.id,
            report_period_start: periodStart,
            report_period_end: periodEnd,
            total_headcount: totalHeadcount || 0,
            new_hires: newHires,
            terminations: terminations || 0,
            pending_approvals: leavePending || 0,
            active_clearances: activeClearances || 0,
            leave_requests_submitted: leaveSubmitted || 0,
            leave_requests_approved: leaveApproved || 0,
            leave_requests_rejected: leaveRejected || 0,
            leave_requests_pending: leavePending || 0,
            total_leave_days_taken: totalLeaveDays,
            evaluations_completed: evalsCompleted || 0,
            evaluations_pending: evalsPending || 0,
            active_pips: pipData?.length || 0,
            tickets_opened: ticketsOpened || 0,
            tickets_resolved: ticketsResolved || 0,
            tickets_pending: ticketsPending || 0,
            open_positions: openPositions || 0,
            new_applications: newApplications || 0,
            interviews_scheduled: interviewsScheduled || 0,
            report_summary: reportSummary,
            report_data: reportData,
            status: 'generated',
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error inserting report:', insertError);
          throw insertError;
        }

        console.log('Report created:', report.id);

        // Send email
        if (resendApiKey) {
          const resend = new Resend(resendApiKey);

          const { data: adminProfiles } = await supabase
            .from('profiles')
            .select('email, first_name, last_name, role')
            .eq('tenant_id', tenant.id)
            .eq('is_active', true)
            .in('role', ['admin', 'superadmin']);

          const recipientEmails = adminProfiles?.map(p => p.email).filter(Boolean) || [];

          if (recipientEmails.length > 0) {
            console.log(`Sending report email to ${recipientEmails.length} recipients`);

            const trendArrow = (curr: number, prev: number) => {
              if (curr > prev) return `↑ ${curr - prev}`;
              if (curr < prev) return `↓ ${prev - curr}`;
              return '→ 0';
            };

            const onLeaveRows = onLeaveDetails.slice(0, 15).map(e => `
              <tr>
                <td style="padding: 6px 8px; border-bottom: 1px solid #f1f5f9; font-size: 13px;">${e.name}</td>
                <td style="padding: 6px 8px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #64748b;">${e.department}</td>
                <td style="padding: 6px 8px; border-bottom: 1px solid #f1f5f9; font-size: 13px;">${e.leave_type}</td>
                <td style="padding: 6px 8px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #64748b;">${e.start_date} → ${e.end_date}</td>
              </tr>`).join('');

            const newHireRows = (newHiresList || []).map(h => `
              <tr>
                <td style="padding: 6px 8px; border-bottom: 1px solid #f1f5f9; font-size: 13px;">${h.first_name} ${h.last_name}</td>
                <td style="padding: 6px 8px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #64748b;">${h.department}</td>
                <td style="padding: 6px 8px; border-bottom: 1px solid #f1f5f9; font-size: 13px;">${h.position}</td>
                <td style="padding: 6px 8px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #64748b;">${h.hire_date}</td>
              </tr>`).join('');

            const leaveTypeRows = Object.entries(leaveByType).map(([type, val]) => `
              <tr>
                <td style="padding: 6px 8px; border-bottom: 1px solid #f1f5f9; font-size: 13px;">${type}</td>
                <td style="padding: 6px 8px; border-bottom: 1px solid #f1f5f9; font-size: 13px; text-align: right;">${val.count}</td>
                <td style="padding: 6px 8px; border-bottom: 1px solid #f1f5f9; font-size: 13px; text-align: right; font-weight: bold;">${val.days}</td>
              </tr>`).join('');

            const expiringRows = (expiringContracts || []).map(c => `
              <tr>
                <td style="padding: 6px 8px; border-bottom: 1px solid #f1f5f9; font-size: 13px;">${c.first_name} ${c.last_name}</td>
                <td style="padding: 6px 8px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #64748b;">${c.department}</td>
                <td style="padding: 6px 8px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #dc2626; font-weight: bold;">${c.contract_end_date}</td>
              </tr>`).join('');

            const emailHtml = `
              <div style="font-family: Arial, sans-serif; max-width: 750px; margin: 0 auto; padding: 20px; background: #f9fafb;">
                <div style="background: white; border-radius: 12px; padding: 30px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                  <h1 style="color: #1e293b; margin-bottom: 5px;">📊 Weekly HR Report</h1>
                  <p style="color: #64748b; margin-top: 0;">${tenant.name} — ${periodStart} to ${periodEnd}</p>
                  
                  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                  
                  <!-- Trend Summary -->
                  <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
                    <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #334155;">📈 Week-over-Week Trends</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 4px 8px; font-size: 13px; color: #64748b;">Headcount</td>
                        <td style="padding: 4px 8px; font-size: 13px; text-align: right; font-weight: bold;">${totalHeadcount || 0} <span style="color: ${(totalHeadcount || 0) >= (prevHeadcount || 0) ? '#16a34a' : '#dc2626'}; font-size: 11px;">${trendArrow(totalHeadcount || 0, prevHeadcount || 0)}</span></td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 8px; font-size: 13px; color: #64748b;">Leave Requests</td>
                        <td style="padding: 4px 8px; font-size: 13px; text-align: right; font-weight: bold;">${leaveSubmitted || 0} <span style="font-size: 11px; color: #64748b;">${trendArrow(leaveSubmitted || 0, prevLeaveSubmitted || 0)}</span></td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 8px; font-size: 13px; color: #64748b;">Leave Days Taken</td>
                        <td style="padding: 4px 8px; font-size: 13px; text-align: right; font-weight: bold;">${totalLeaveDays} <span style="font-size: 11px; color: #64748b;">${trendArrow(totalLeaveDays, prevTotalLeaveDays)}</span></td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 8px; font-size: 13px; color: #64748b;">New Tickets</td>
                        <td style="padding: 4px 8px; font-size: 13px; text-align: right; font-weight: bold;">${ticketsOpened || 0} <span style="font-size: 11px; color: #64748b;">${trendArrow(ticketsOpened || 0, prevTicketsOpened || 0)}</span></td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 8px; font-size: 13px; color: #64748b;">Applications</td>
                        <td style="padding: 4px 8px; font-size: 13px; text-align: right; font-weight: bold;">${newApplications || 0} <span style="font-size: 11px; color: #64748b;">${trendArrow(newApplications || 0, prevNewApplications || 0)}</span></td>
                      </tr>
                    </table>
                  </div>

                  <h2 style="color: #334155; font-size: 16px;">👥 HR Overview</h2>
                  <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
                    <tr><td style="padding: 8px 0; color: #64748b;">Total Active Staff</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${totalHeadcount || 0}</td></tr>
                    <tr><td style="padding: 8px 0; color: #64748b;">New Hires</td><td style="padding: 8px 0; font-weight: bold; text-align: right; color: #16a34a;">${newHires}</td></tr>
                    <tr><td style="padding: 8px 0; color: #64748b;">Terminations</td><td style="padding: 8px 0; font-weight: bold; text-align: right; color: #dc2626;">${terminations || 0}</td></tr>
                    <tr><td style="padding: 8px 0; color: #64748b;">Active Clearances</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${activeClearances || 0}</td></tr>
                  </table>
                  
                  ${newHireRows ? `
                    <h3 style="font-size: 13px; color: #475569; margin: 10px 0 5px 0;">New Hires This Week</h3>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; background: #f8fafc; border-radius: 6px;">
                      <tr style="background: #e2e8f0;"><th style="padding: 6px 8px; text-align: left; font-size: 12px;">Name</th><th style="padding: 6px 8px; text-align: left; font-size: 12px;">Department</th><th style="padding: 6px 8px; text-align: left; font-size: 12px;">Position</th><th style="padding: 6px 8px; text-align: left; font-size: 12px;">Date</th></tr>
                      ${newHireRows}
                    </table>` : ''}

                  ${expiringRows ? `
                    <h3 style="font-size: 13px; color: #dc2626; margin: 10px 0 5px 0;">⚠️ Contracts Expiring Within 30 Days (${expiringContracts?.length || 0})</h3>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; background: #fef2f2; border-radius: 6px;">
                      <tr style="background: #fecaca;"><th style="padding: 6px 8px; text-align: left; font-size: 12px;">Name</th><th style="padding: 6px 8px; text-align: left; font-size: 12px;">Department</th><th style="padding: 6px 8px; text-align: left; font-size: 12px;">Expires</th></tr>
                      ${expiringRows}
                    </table>` : ''}
                  
                  <h2 style="color: #334155; font-size: 16px;">🏖️ Leave & Attendance</h2>
                  <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
                    <tr><td style="padding: 8px 0; color: #64748b;">Submitted</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${leaveSubmitted || 0}</td></tr>
                    <tr><td style="padding: 8px 0; color: #64748b;">Approved</td><td style="padding: 8px 0; font-weight: bold; text-align: right; color: #16a34a;">${leaveApproved || 0}</td></tr>
                    <tr><td style="padding: 8px 0; color: #64748b;">Rejected</td><td style="padding: 8px 0; font-weight: bold; text-align: right; color: #dc2626;">${leaveRejected || 0}</td></tr>
                    <tr><td style="padding: 8px 0; color: #64748b;">Pending</td><td style="padding: 8px 0; font-weight: bold; text-align: right; color: #f59e0b;">${leavePending || 0}</td></tr>
                    <tr><td style="padding: 8px 0; color: #64748b;">Total Leave Days</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${totalLeaveDays}</td></tr>
                  </table>
                  
                  ${leaveTypeRows ? `
                    <h3 style="font-size: 13px; color: #475569; margin: 10px 0 5px 0;">Leave Breakdown by Type</h3>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; background: #f8fafc; border-radius: 6px;">
                      <tr style="background: #e2e8f0;"><th style="padding: 6px 8px; text-align: left; font-size: 12px;">Type</th><th style="padding: 6px 8px; text-align: right; font-size: 12px;">Requests</th><th style="padding: 6px 8px; text-align: right; font-size: 12px;">Days</th></tr>
                      ${leaveTypeRows}
                    </table>` : ''}

                  ${onLeaveRows ? `
                    <h3 style="font-size: 13px; color: #475569; margin: 10px 0 5px 0;">Employees On Leave This Week (${onLeaveDetails.length})</h3>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; background: #f8fafc; border-radius: 6px;">
                      <tr style="background: #e2e8f0;"><th style="padding: 6px 8px; text-align: left; font-size: 12px;">Name</th><th style="padding: 6px 8px; text-align: left; font-size: 12px;">Department</th><th style="padding: 6px 8px; text-align: left; font-size: 12px;">Type</th><th style="padding: 6px 8px; text-align: left; font-size: 12px;">Period</th></tr>
                      ${onLeaveRows}
                    </table>` : ''}
                  
                  <h2 style="color: #334155; font-size: 16px;">📈 Performance</h2>
                  <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
                    <tr><td style="padding: 8px 0; color: #64748b;">Evaluations Completed</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${evalsCompleted || 0}</td></tr>
                    <tr><td style="padding: 8px 0; color: #64748b;">Evaluations Pending</td><td style="padding: 8px 0; font-weight: bold; text-align: right; color: #f59e0b;">${evalsPending || 0}</td></tr>
                    <tr><td style="padding: 8px 0; color: #64748b;">Active PIPs</td><td style="padding: 8px 0; font-weight: bold; text-align: right; color: #dc2626;">${pipData?.length || 0}</td></tr>
                  </table>

                  ${pipDetails.length > 0 ? `
                    <h3 style="font-size: 13px; color: #dc2626; margin: 10px 0 5px 0;">Employees on PIP</h3>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; background: #fef2f2; border-radius: 6px;">
                      ${pipDetails.map(p => `<tr><td style="padding: 6px 8px; font-size: 13px;">${p.name}</td><td style="padding: 6px 8px; font-size: 13px; color: #64748b;">${p.department}</td><td style="padding: 6px 8px; font-size: 13px; color: #64748b;">${p.start_date} → ${p.end_date}</td></tr>`).join('')}
                    </table>` : ''}
                  
                  <h2 style="color: #334155; font-size: 16px;">🎫 Support Tickets</h2>
                  <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <tr><td style="padding: 8px 0; color: #64748b;">New Tickets</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${ticketsOpened || 0}</td></tr>
                    <tr><td style="padding: 8px 0; color: #64748b;">Resolved</td><td style="padding: 8px 0; font-weight: bold; text-align: right; color: #16a34a;">${ticketsResolved || 0}</td></tr>
                    <tr><td style="padding: 8px 0; color: #64748b;">Pending</td><td style="padding: 8px 0; font-weight: bold; text-align: right; color: #f59e0b;">${ticketsPending || 0}</td></tr>
                  </table>
                  
                  <h2 style="color: #334155; font-size: 16px;">🔍 Recruitment</h2>
                  <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <tr><td style="padding: 8px 0; color: #64748b;">Open Positions</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${openPositions || 0}</td></tr>
                    <tr><td style="padding: 8px 0; color: #64748b;">New Applications</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${newApplications || 0}</td></tr>
                    <tr><td style="padding: 8px 0; color: #64748b;">Interviews Scheduled</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${interviewsScheduled || 0}</td></tr>
                  </table>
                  
                  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                  <p style="color: #94a3b8; font-size: 12px; text-align: center;">
                    This report was auto-generated by ${tenant.name} HR Portal. 
                    Log in to your dashboard to view the full report.
                  </p>
                </div>
              </div>
            `;

            try {
              await resend.emails.send({
                from: `${tenant.name} HR <noreply@hr.whitestarschools.com>`,
                to: recipientEmails,
                subject: `📊 Weekly HR Report — ${periodStart} to ${periodEnd}`,
                html: emailHtml,
              });

              await supabase
                .from('weekly_management_reports')
                .update({
                  email_sent: true,
                  email_sent_at: new Date().toISOString(),
                  email_recipients: recipientEmails,
                  status: 'sent',
                })
                .eq('id', report.id);

              console.log('Email sent successfully');
            } catch (emailError) {
              console.error('Error sending email:', emailError);
              await supabase
                .from('weekly_management_reports')
                .update({ status: 'failed' })
                .eq('id', report.id);
            }
          } else {
            console.log('No admin recipients found');
          }
        } else {
          console.log('RESEND_API_KEY not configured');
        }

        results.push({ tenant: tenant.name, status: 'success', reportId: report.id });
      } catch (tenantErr) {
        console.error(`Error processing tenant ${tenant.name}:`, tenantErr);
        results.push({ tenant: tenant.name, status: 'error', error: tenantErr.message });
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating weekly report:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
