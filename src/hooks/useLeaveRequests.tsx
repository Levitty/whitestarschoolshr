import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useTenant } from '@/contexts/TenantContext';

type LeaveRequest = Database['public']['Tables']['leave_requests']['Row'];

// Extended type for leave requests with employee data
interface EnrichedLeaveRequest extends LeaveRequest {
  employee_profile?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    department: string;
    position?: string;
  };
  profile?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
    department: string | null;
  };
}

export const useLeaveRequests = () => {
  const { user } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState<EnrichedLeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { tenant } = useTenant();

  useEffect(() => {
    if (user && tenant?.id) {
      // Fix any orphaned leave requests first, then fetch
      const init = async () => {
        await fixMissingTenantIds();
        await fetchLeaveRequests();
      };
      init();
    }
  }, [user, tenant?.id]);

  const fixMissingTenantIds = async () => {
    if (!user || !tenant?.id) return;
    
    // Update leave requests missing tenant_id for the current tenant's users
    await supabase
      .from('leave_requests')
      .update({ tenant_id: tenant.id } as any)
      .is('tenant_id', null);
  };

  const fetchLeaveRequests = async () => {
    if (!user) return;
    
    // Only fetch if tenant is available
    if (!tenant?.id) {
      console.log('Skipping leave requests fetch - no tenant');
      setLeaveRequests([]);
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching leave requests for tenant:', tenant.id);
      
      // Fetch all leave requests with workflow fields
      const { data: leaveRequestsData, error } = await supabase
        .from('leave_requests')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching leave requests:', error);
        setLeaveRequests([]);
        return;
      }

      console.log('Raw leave requests:', leaveRequestsData?.length || 0);

      // If we have leave requests, enrich them with employee data
      if (leaveRequestsData && leaveRequestsData.length > 0) {
        const enrichedRequests = await Promise.all(
          leaveRequestsData.map(async (request) => {
            let employeeData = null;
            
            if (request.employee_id) {
              // Try to get from employee_profiles first
              const { data: empProfile } = await supabase
                .from('employee_profiles')
                .select('id, first_name, last_name, email, department, position')
                .eq('profile_id', request.employee_id)
                .maybeSingle();
              
              if (empProfile) {
                employeeData = { employee_profile: empProfile };
              } else {
                // Fallback to profiles table
                const { data: profile } = await supabase
                  .from('profiles')
                  .select('id, first_name, last_name, email, department')
                  .eq('id', request.employee_id)
                  .maybeSingle();
                
                if (profile) {
                  employeeData = { profile: profile };
                }
              }
            }
            
            return {
              ...request,
              ...employeeData
            } as EnrichedLeaveRequest;
          })
        );
        console.log('Enriched leave requests with employee data:', enrichedRequests);
        setLeaveRequests(enrichedRequests);
      } else {
        console.log('No leave requests found');
        setLeaveRequests([]);
      }
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      setLeaveRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const createLeaveRequest = async (
    leaveType: string,
    startDate: string,
    endDate: string,
    reason: string
  ) => {
    if (!user) return { error: 'No user found' };
    if (!tenant?.id) return { error: 'No tenant found' };

    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const daysRequested = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      const { error } = await supabase
        .from('leave_requests')
        .insert({
          employee_id: user.id,
          leave_type: leaveType,
          start_date: startDate,
          end_date: endDate,
          days_requested: daysRequested,
          reason,
          status: 'pending',
          workflow_stage: 'pending_head',
          tenant_id: tenant.id
        } as any);

      if (error) {
        return { error };
      }

      await fetchLeaveRequests();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  // Head Teacher forwards request to HR with recommendation and internal notes
  const forwardToHR = async (
    requestId: string,
    recommendation: 'recommend_approve' | 'recommend_reject' | 'neutral',
    internalNotes: string
  ) => {
    if (!user) return { error: 'No user found' };

    try {
      const { error } = await supabase
        .from('leave_requests')
        .update({
          workflow_stage: 'pending_hr',
          head_reviewed_by: user.id,
          head_reviewed_at: new Date().toISOString(),
          head_recommendation: recommendation,
          head_internal_notes: internalNotes
        } as any)
        .eq('id', requestId);

      if (error) {
        return { error };
      }

      await fetchLeaveRequests();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  // HR/Admin approves leave request (final decision) and deducts leave balance
  const approveLeaveRequest = async (requestId: string, comments?: string) => {
    if (!user) return { error: 'No user found' };

    try {
      // First, get the leave request details
      const { data: leaveRequest, error: fetchError } = await supabase
        .from('leave_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (fetchError || !leaveRequest) {
        return { error: fetchError || 'Leave request not found' };
      }

      // Update the leave request status
      const { error } = await supabase
        .from('leave_requests')
        .update({
          status: 'approved',
          workflow_stage: 'approved',
          approved_by: user.id,
          decision_at: new Date().toISOString(),
          comments
        } as any)
        .eq('id', requestId);

      if (error) {
        return { error };
      }

      // Deduct leave balance
      const currentYear = new Date().getFullYear();
      const leaveType = leaveRequest.leave_type.toLowerCase();
      const daysRequested = leaveRequest.days_requested;

      // Get employee_profile id from the profile_id (employee_id in leave_requests)
      const { data: employeeProfile } = await supabase
        .from('employee_profiles')
        .select('id')
        .eq('profile_id', leaveRequest.employee_id)
        .single();

      if (employeeProfile) {
        // Get current leave balance
        const { data: currentBalance } = await supabase
          .from('leave_balances')
          .select('*')
          .eq('employee_id', employeeProfile.id)
          .eq('year', currentYear)
          .single();

        if (currentBalance) {
          // Determine which field to update based on leave type
          const updateField = getLeaveBalanceField(leaveType);
          if (updateField) {
            const currentUsed = (currentBalance as any)[updateField] || 0;
            const newUsed = currentUsed + daysRequested;

            await supabase
              .from('leave_balances')
              .update({ [updateField]: newUsed } as any)
              .eq('id', currentBalance.id);
          }
        }
      }

      await fetchLeaveRequests();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  // Helper function to get the correct leave balance field name
  const getLeaveBalanceField = (leaveType: string): string | null => {
    const typeMap: Record<string, string> = {
      'annual': 'annual_leave_used',
      'sick': 'sick_leave_used',
      'maternity': 'maternity_leave_used',
      'study': 'study_leave_used',
      'unpaid': 'unpaid_leave_used',
    };
    return typeMap[leaveType] || null;
  };

  // HR/Admin rejects leave request (final decision)
  const rejectLeaveRequest = async (requestId: string, comments?: string) => {
    if (!user) return { error: 'No user found' };

    try {
      const { error } = await supabase
        .from('leave_requests')
        .update({
          status: 'rejected',
          workflow_stage: 'rejected',
          approved_by: user.id,
          decision_at: new Date().toISOString(),
          comments
        } as any)
        .eq('id', requestId);

      if (error) {
        return { error };
      }

      await fetchLeaveRequests();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  // Delete leave request (for admins to remove invalid requests)
  const deleteLeaveRequest = async (requestId: string) => {
    if (!user) return { error: 'No user found' };

    try {
      const { error } = await supabase
        .from('leave_requests')
        .delete()
        .eq('id', requestId);

      if (error) {
        return { error };
      }

      await fetchLeaveRequests();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  return {
    leaveRequests,
    loading,
    fetchLeaveRequests,
    createLeaveRequest,
    forwardToHR,
    approveLeaveRequest,
    rejectLeaveRequest,
    deleteLeaveRequest
  };
};
