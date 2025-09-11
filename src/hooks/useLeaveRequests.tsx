
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type LeaveRequest = Database['public']['Tables']['leave_requests']['Row'];
type LeaveRequestInsert = Database['public']['Tables']['leave_requests']['Insert'];

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

  useEffect(() => {
    if (user) {
      fetchLeaveRequests();
    }
  }, [user]);

  const fetchLeaveRequests = async () => {
    if (!user) return;

    try {
      console.log('Fetching leave requests...');
      
      // First get all leave requests
      const { data: leaveRequestsData, error } = await supabase
        .from('leave_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching leave requests:', error);
        setLeaveRequests([]);
        return;
      }

      console.log('Raw leave requests:', leaveRequestsData);

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
            };
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

    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const daysRequested = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      const requestData: LeaveRequestInsert = {
        employee_id: user.id,
        leave_type: leaveType,
        start_date: startDate,
        end_date: endDate,
        days_requested: daysRequested,
        reason,
        status: 'pending'
      };

      const { error } = await supabase
        .from('leave_requests')
        .insert(requestData);

      if (error) {
        return { error };
      }

      await fetchLeaveRequests();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const approveLeaveRequest = async (requestId: string, comments?: string) => {
    if (!user) return { error: 'No user found' };

    try {
      const { error } = await supabase
        .from('leave_requests')
        .update({
          status: 'approved',
          approved_by: user.id,
          decision_at: new Date().toISOString(),
          comments
        })
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

  const rejectLeaveRequest = async (requestId: string, comments?: string) => {
    if (!user) return { error: 'No user found' };

    try {
      const { error } = await supabase
        .from('leave_requests')
        .update({
          status: 'rejected',
          approved_by: user.id,
          decision_at: new Date().toISOString(),
          comments
        })
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
    approveLeaveRequest,
    rejectLeaveRequest
  };
};
