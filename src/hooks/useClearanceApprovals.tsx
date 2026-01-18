import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

export interface ClearanceApproval {
  id: string;
  clearance_id: string;
  tenant_id: string;
  department: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  approver?: {
    first_name: string | null;
    last_name: string | null;
  };
}

export const useClearanceApprovals = () => {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();

  const fetchClearanceApprovals = (clearanceId: string) => {
    return useQuery({
      queryKey: ['clearance-approvals', clearanceId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('clearance_approvals')
          .select(`
            *,
            approver:profiles!clearance_approvals_approved_by_fkey(first_name, last_name)
          `)
          .eq('clearance_id', clearanceId)
          .order('department');

        if (error) throw error;
        return data as ClearanceApproval[];
      },
      enabled: !!clearanceId,
    });
  };

  const fetchPendingApprovalsForUser = () => {
    return useQuery({
      queryKey: ['pending-approvals-for-user', user?.id, profile?.department],
      queryFn: async () => {
        if (!user?.id) return [];

        let query = supabase
          .from('clearance_approvals')
          .select(`
            *,
            clearance:offboarding_clearance(
              id,
              employee:employee_profiles(
                id,
                first_name,
                last_name,
                employee_number
              )
            )
          `)
          .eq('status', 'pending');

        // If not admin/superadmin, filter by user's department
        if (profile?.role && !['admin', 'superadmin'].includes(profile.role)) {
          if (profile?.department) {
            query = query.eq('department', profile.department);
          } else {
            return [];
          }
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        return data;
      },
      enabled: !!user?.id,
    });
  };

  const approveSection = useMutation({
    mutationFn: async ({ approvalId, notes }: { approvalId: string; notes?: string }) => {
      const { data, error } = await supabase
        .from('clearance_approvals')
        .update({
          status: 'approved',
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
          notes: notes || null,
        })
        .eq('id', approvalId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['clearance-approvals', data.clearance_id] });
      queryClient.invalidateQueries({ queryKey: ['pending-approvals-for-user'] });
      toast.success('Section approved successfully');
    },
    onError: (error) => {
      console.error('Error approving section:', error);
      toast.error('Failed to approve section');
    },
  });

  const rejectSection = useMutation({
    mutationFn: async ({ approvalId, rejectionReason }: { approvalId: string; rejectionReason: string }) => {
      const { data, error } = await supabase
        .from('clearance_approvals')
        .update({
          status: 'rejected',
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
          rejection_reason: rejectionReason,
        })
        .eq('id', approvalId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['clearance-approvals', data.clearance_id] });
      queryClient.invalidateQueries({ queryKey: ['pending-approvals-for-user'] });
      toast.success('Section rejected');
    },
    onError: (error) => {
      console.error('Error rejecting section:', error);
      toast.error('Failed to reject section');
    },
  });

  const resetApproval = useMutation({
    mutationFn: async (approvalId: string) => {
      const { data, error } = await supabase
        .from('clearance_approvals')
        .update({
          status: 'pending',
          approved_by: null,
          approved_at: null,
          rejection_reason: null,
          notes: null,
        })
        .eq('id', approvalId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['clearance-approvals', data.clearance_id] });
      queryClient.invalidateQueries({ queryKey: ['pending-approvals-for-user'] });
      toast.success('Approval reset to pending');
    },
    onError: (error) => {
      console.error('Error resetting approval:', error);
      toast.error('Failed to reset approval');
    },
  });

  const canUserApprove = (department: string): boolean => {
    if (!profile) return false;
    if (['admin', 'superadmin'].includes(profile.role || '')) return true;
    if (profile.role === 'head' && profile.department === department) return true;
    return false;
  };

  const isFullyApproved = async (clearanceId: string): Promise<boolean> => {
    const { data, error } = await supabase
      .rpc('check_clearance_fully_approved', { p_clearance_id: clearanceId });
    
    if (error) {
      console.error('Error checking fully approved:', error);
      return false;
    }
    return data;
  };

  return {
    fetchClearanceApprovals,
    fetchPendingApprovalsForUser,
    approveSection,
    rejectSection,
    resetApproval,
    canUserApprove,
    isFullyApproved,
  };
};
