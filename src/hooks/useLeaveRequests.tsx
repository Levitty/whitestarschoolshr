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
              // Try to get from employee_profiles by profile_id first
              const { data: empProfile } = await supabase
                .from('employee_profiles')
                .select('id, first_name, last_name, email, department, position')
                .eq('profile_id', request.employee_id)
                .maybeSingle();
              
              if (empProfile) {
                employeeData = { employee_profile: empProfile };
              } else {
                // Try employee_profiles by id (employee_id might reference employee_profiles directly)
                const { data: empById } = await supabase
                  .from('employee_profiles')
                  .select('id, first_name, last_name, email, department, position')
                  .eq('id', request.employee_id)
                  .maybeSingle();
                
                if (empById) {
                  employeeData = { employee_profile: empById };
                } else {
                  // Fallback to profiles table
                  const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('id, first_name, last_name, email, department')
                    .eq('id', request.employee_id)
                    .maybeSingle();
                  
                  console.log('Profile fallback for', request.employee_id, ':', profile, 'Error:', profileError);
                  
                  if (profile) {
                    // Map profile data to employee_profile format so display components work uniformly
                    employeeData = { 
                      employee_profile: {
                        id: profile.id,
                        first_name: profile.first_name || '',
                        last_name: profile.last_name || '',
                        email: profile.email,
                        department: profile.department || 'N/A',
                        position: 'Staff'
                      }
                    };
                  }
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
    reason: string,
    proofFile?: File
  ) => {
    if (!user) return { error: 'No user found' };
    if (!tenant?.id) return { error: 'No tenant found' };

    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const daysRequested = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      let proofUrl: string | null = null;
      let proofFileName: string | null = null;

      // Upload proof file if provided
      if (proofFile) {
        const fileExt = proofFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('leave-proofs')
          .upload(fileName, proofFile);

        if (uploadError) {
          console.error('Error uploading proof file:', uploadError);
          return { error: uploadError };
        }

        // Store the file path (bucket is private, we'll use signed URLs to access)
        proofUrl = fileName;
        proofFileName = proofFile.name;
      }

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
          tenant_id: tenant.id,
          proof_url: proofUrl,
          proof_file_name: proofFileName
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

      console.log('Deducting leave balance for employee:', leaveRequest.employee_id, 'Type:', leaveType, 'Days:', daysRequested);

      // Get employee_profile id from the profile_id (employee_id in leave_requests)
      const { data: employeeProfile, error: empError } = await supabase
        .from('employee_profiles')
        .select('id')
        .eq('profile_id', leaveRequest.employee_id)
        .maybeSingle();

      console.log('Employee profile lookup:', employeeProfile, 'Error:', empError);

      if (employeeProfile) {
        // Get current leave balance
        const { data: currentBalance, error: balanceError } = await supabase
          .from('leave_balances')
          .select('*')
          .eq('employee_id', employeeProfile.id)
          .eq('year', currentYear)
          .maybeSingle();

        console.log('Current balance:', currentBalance, 'Error:', balanceError);

        if (currentBalance) {
          // Determine which field to update based on leave type
          const updateField = getLeaveBalanceField(leaveType);
          if (updateField) {
            const currentUsed = (currentBalance as any)[updateField] || 0;
            const newUsed = currentUsed + daysRequested;

            console.log('Updating field:', updateField, 'From:', currentUsed, 'To:', newUsed);

            const { error: updateError } = await supabase
              .from('leave_balances')
              .update({ [updateField]: newUsed } as any)
              .eq('id', currentBalance.id);

            if (updateError) {
              console.error('Failed to update leave balance:', updateError);
            } else {
              console.log('Leave balance updated successfully');
            }
          }
        } else {
          console.warn('No leave balance found for employee:', employeeProfile.id, 'Year:', currentYear);
        }
      } else {
        console.warn('No employee profile found for user:', leaveRequest.employee_id);
      }

      await fetchLeaveRequests();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  // Helper function to get the correct leave balance field name
  const getLeaveBalanceField = (leaveType: string): string | null => {
    // Normalize the leave type - handle various formats
    const normalizedType = leaveType.toLowerCase().trim();
    const typeMap: Record<string, string> = {
      'annual': 'annual_leave_used',
      'annual leave': 'annual_leave_used',
      'sick': 'sick_leave_used',
      'sick leave': 'sick_leave_used',
      'maternity': 'maternity_leave_used',
      'maternity leave': 'maternity_leave_used',
      'study': 'study_leave_used',
      'study leave': 'study_leave_used',
      'unpaid': 'unpaid_leave_used',
      'unpaid leave': 'unpaid_leave_used',
    };
    return typeMap[normalizedType] || null;
  };

  // Sync leave balances for all approved requests (retroactive fix)
  const syncApprovedLeaveBalances = async () => {
    if (!user || !tenant?.id) return { error: 'No user or tenant found' };

    try {
      console.log('Starting retroactive leave balance sync...');
      
      // Get all approved leave requests
      const { data: approvedRequests, error: fetchError } = await supabase
        .from('leave_requests')
        .select('*')
        .eq('status', 'approved')
        .eq('tenant_id', tenant.id);

      if (fetchError) {
        console.error('Error fetching approved requests:', fetchError);
        return { error: fetchError };
      }

      console.log('Found approved requests:', approvedRequests?.length || 0);

      // Reset all leave balances to 0 first
      const currentYear = new Date().getFullYear();
      await supabase
        .from('leave_balances')
        .update({
          annual_leave_used: 0,
          sick_leave_used: 0,
          maternity_leave_used: 0,
          study_leave_used: 0,
          unpaid_leave_used: 0
        } as any)
        .eq('year', currentYear);

      // Now add up all approved leave
      for (const request of (approvedRequests || [])) {
        const leaveType = request.leave_type.toLowerCase();
        const daysRequested = request.days_requested;

        // Get employee_profile id
        const { data: employeeProfile } = await supabase
          .from('employee_profiles')
          .select('id')
          .eq('profile_id', request.employee_id)
          .maybeSingle();

        if (employeeProfile) {
          const { data: currentBalance } = await supabase
            .from('leave_balances')
            .select('*')
            .eq('employee_id', employeeProfile.id)
            .eq('year', currentYear)
            .maybeSingle();

          if (currentBalance) {
            const updateField = getLeaveBalanceField(leaveType);
            if (updateField) {
              const currentUsed = (currentBalance as any)[updateField] || 0;
              const newUsed = currentUsed + daysRequested;

              console.log(`Updating ${employeeProfile.id}: ${updateField} from ${currentUsed} to ${newUsed}`);

              await supabase
                .from('leave_balances')
                .update({ [updateField]: newUsed } as any)
                .eq('id', currentBalance.id);
            }
          }
        }
      }

      console.log('Leave balance sync complete');
      return { error: null };
    } catch (error) {
      console.error('Error syncing leave balances:', error);
      return { error };
    }
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
    deleteLeaveRequest,
    syncApprovedLeaveBalances
  };
};
