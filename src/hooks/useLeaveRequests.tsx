
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type LeaveRequest = Database['public']['Tables']['leave_requests']['Row'];
type LeaveRequestInsert = Database['public']['Tables']['leave_requests']['Insert'];

export const useLeaveRequests = () => {
  const { user } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchLeaveRequests();
    }
  }, [user]);

  const fetchLeaveRequests = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('leave_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching leave requests:', error);
      } else {
        setLeaveRequests(data || []);
      }
    } catch (error) {
      console.error('Error fetching leave requests:', error);
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
          reviewed_by: user.id,
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
          reviewed_by: user.id,
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
