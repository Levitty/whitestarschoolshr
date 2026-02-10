import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    // Parse optional body for manual trigger with specific tenant
    let targetTenantId: string | null = null;
    try {
      const body = await req.json();
      targetTenantId = body?.tenant_id || null;
    } catch {
      // No body = cron trigger, process all tenants
    }

    // Get tenants to process
    let tenantsQuery = supabase.from('tenants').select('id, name');
    if (targetTenantId) {
      tenantsQuery = tenantsQuery.eq('id', targetTenantId);
    }
    const { data: tenants, error: tenantError } = await tenantsQuery;

    if (tenantError) {
      console.error('Error fetching tenants:', tenantError);
      throw tenantError;
    }

    console.log(`Processing ${tenants?.length || 0} tenants`);

    const now = new Date();
    // Report period: Monday to Friday of the current week
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    monday.setHours(0, 0, 0, 0);
    
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);
    friday.setHours(23, 59, 59, 999);

    const periodStart = monday.toISOString().split('T')[0];
    const periodEnd = friday.toISOString().split('T')[0];

    const results = [];

    for (const tenant of tenants || []) {
      console.log(`Generating report for tenant: ${tenant.name} (${tenant.id})`);

      try {
        // 1. HR Summary - Total headcount
        const { count: totalHeadcount } = await supabase
          .from('employee_profiles')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenant.id)
          .eq('status', 'active');

        // New hires this week
        const { count: newHires } = await supabase
          .from('employee_profiles')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenant.id)
          .gte('hire_date', periodStart)
          .lte('hire_date', periodEnd);

        // Terminations (inactive this week)
        const { count: terminations } = await supabase
          .from('employee_profiles')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenant.id)
          .eq('status', 'inactive')
          .gte('updated_at', periodStart);

        // Active clearances
        const { count: activeClearances } = await supabase
          .from('offboarding_clearance')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenant.id)
          .in('status', ['initiated', 'in_progress']);

        // 2. Leave metrics this week
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

        // Total leave days taken this week
        const { data: approvedLeaves } = await supabase
          .from('leave_requests')
          .select('days_requested')
          .eq('tenant_id', tenant.id)
          .eq('status', 'approved')
          .gte('start_date', periodStart)
          .lte('start_date', periodEnd);

        const totalLeaveDays = approvedLeaves?.reduce((sum, l) => sum + (l.days_requested || 0), 0) || 0;

        // 3. Performance metrics
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

        // Active PIPs
        const { count: activePips } = await supabase
          .from('performance_improvement_plans')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenant.id)
          .eq('status', 'active');

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

        // Build report summary
        const reportSummary = `Weekly HR Report for ${tenant.name} (${periodStart} to ${periodEnd})

HR OVERVIEW:
• Total Active Staff: ${totalHeadcount || 0}
• New Hires This Week: ${newHires || 0}
• Terminations: ${terminations || 0}
• Active Clearances: ${activeClearances || 0}

LEAVE & ATTENDANCE:
• Leave Requests Submitted: ${leaveSubmitted || 0}
• Approved: ${leaveApproved || 0}
• Rejected: ${leaveRejected || 0}
• Pending: ${leavePending || 0}
• Total Leave Days Taken: ${totalLeaveDays}

PERFORMANCE:
• Evaluations Completed: ${evalsCompleted || 0}
• Evaluations Pending: ${evalsPending || 0}
• Active PIPs: ${activePips || 0}

SUPPORT TICKETS:
• New Tickets: ${ticketsOpened || 0}
• Resolved: ${ticketsResolved || 0}
• Pending: ${ticketsPending || 0}

RECRUITMENT:
• Open Positions: ${openPositions || 0}
• New Applications: ${newApplications || 0}
• Interviews Scheduled: ${interviewsScheduled || 0}`;

        const reportData = {
          hr: { totalHeadcount: totalHeadcount || 0, newHires: newHires || 0, terminations: terminations || 0, activeClearances: activeClearances || 0 },
          leave: { submitted: leaveSubmitted || 0, approved: leaveApproved || 0, rejected: leaveRejected || 0, pending: leavePending || 0, totalDays: totalLeaveDays },
          performance: { completed: evalsCompleted || 0, pending: evalsPending || 0, activePips: activePips || 0 },
          tickets: { opened: ticketsOpened || 0, resolved: ticketsResolved || 0, pending: ticketsPending || 0 },
          recruitment: { openPositions: openPositions || 0, newApplications: newApplications || 0, interviews: interviewsScheduled || 0 },
        };

        // Insert report
        const { data: report, error: insertError } = await supabase
          .from('weekly_management_reports')
          .insert({
            tenant_id: tenant.id,
            report_period_start: periodStart,
            report_period_end: periodEnd,
            total_headcount: totalHeadcount || 0,
            new_hires: newHires || 0,
            terminations: terminations || 0,
            pending_approvals: (leavePending || 0),
            active_clearances: activeClearances || 0,
            leave_requests_submitted: leaveSubmitted || 0,
            leave_requests_approved: leaveApproved || 0,
            leave_requests_rejected: leaveRejected || 0,
            leave_requests_pending: leavePending || 0,
            total_leave_days_taken: totalLeaveDays,
            evaluations_completed: evalsCompleted || 0,
            evaluations_pending: evalsPending || 0,
            active_pips: activePips || 0,
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

        // Send email to admins
        if (resendApiKey) {
          const resend = new Resend(resendApiKey);

          // Get admin/superadmin emails for this tenant
          const { data: adminProfiles } = await supabase
            .from('profiles')
            .select('email, first_name, last_name, role')
            .eq('tenant_id', tenant.id)
            .eq('is_active', true)
            .in('role', ['admin', 'superadmin']);

          const recipientEmails = adminProfiles?.map(p => p.email).filter(Boolean) || [];

          if (recipientEmails.length > 0) {
            console.log(`Sending report email to ${recipientEmails.length} recipients`);

            const emailHtml = `
              <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px; background: #f9fafb;">
                <div style="background: white; border-radius: 12px; padding: 30px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                  <h1 style="color: #1e293b; margin-bottom: 5px;">📊 Weekly HR Report</h1>
                  <p style="color: #64748b; margin-top: 0;">${tenant.name} — ${periodStart} to ${periodEnd}</p>
                  
                  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                  
                  <h2 style="color: #334155; font-size: 16px;">👥 HR Overview</h2>
                  <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <tr><td style="padding: 8px 0; color: #64748b;">Total Active Staff</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${totalHeadcount || 0}</td></tr>
                    <tr><td style="padding: 8px 0; color: #64748b;">New Hires</td><td style="padding: 8px 0; font-weight: bold; text-align: right; color: #16a34a;">${newHires || 0}</td></tr>
                    <tr><td style="padding: 8px 0; color: #64748b;">Terminations</td><td style="padding: 8px 0; font-weight: bold; text-align: right; color: #dc2626;">${terminations || 0}</td></tr>
                    <tr><td style="padding: 8px 0; color: #64748b;">Active Clearances</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${activeClearances || 0}</td></tr>
                  </table>
                  
                  <h2 style="color: #334155; font-size: 16px;">🏖️ Leave & Attendance</h2>
                  <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <tr><td style="padding: 8px 0; color: #64748b;">Requests Submitted</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${leaveSubmitted || 0}</td></tr>
                    <tr><td style="padding: 8px 0; color: #64748b;">Approved</td><td style="padding: 8px 0; font-weight: bold; text-align: right; color: #16a34a;">${leaveApproved || 0}</td></tr>
                    <tr><td style="padding: 8px 0; color: #64748b;">Rejected</td><td style="padding: 8px 0; font-weight: bold; text-align: right; color: #dc2626;">${leaveRejected || 0}</td></tr>
                    <tr><td style="padding: 8px 0; color: #64748b;">Pending</td><td style="padding: 8px 0; font-weight: bold; text-align: right; color: #f59e0b;">${leavePending || 0}</td></tr>
                    <tr><td style="padding: 8px 0; color: #64748b;">Total Leave Days</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${totalLeaveDays}</td></tr>
                  </table>
                  
                  <h2 style="color: #334155; font-size: 16px;">📈 Performance</h2>
                  <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <tr><td style="padding: 8px 0; color: #64748b;">Evaluations Completed</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${evalsCompleted || 0}</td></tr>
                    <tr><td style="padding: 8px 0; color: #64748b;">Evaluations Pending</td><td style="padding: 8px 0; font-weight: bold; text-align: right; color: #f59e0b;">${evalsPending || 0}</td></tr>
                    <tr><td style="padding: 8px 0; color: #64748b;">Active PIPs</td><td style="padding: 8px 0; font-weight: bold; text-align: right; color: #dc2626;">${activePips || 0}</td></tr>
                  </table>
                  
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

              // Update report as sent
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
            console.log('No admin recipients found for tenant');
          }
        } else {
          console.log('RESEND_API_KEY not configured, skipping email');
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
