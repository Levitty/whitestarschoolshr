import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { useToast } from '@/hooks/use-toast';

export interface ClearanceItem {
  id: string;
  clearance_id: string;
  department: 'IT' | 'Finance' | 'Operations';
  item_name: string;
  is_completed: boolean;
  completed_at: string | null;
  completed_by: string | null;
  created_at: string;
}

export interface Clearance {
  id: string;
  employee_id: string;
  tenant_id: string;
  status: 'pending' | 'in_progress' | 'completed';
  initiated_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  items?: ClearanceItem[];
  outstanding_salary?: number;
  leave_balance_payout?: number;
  total_deductions?: number;
  final_settlement_amount?: number;
  settlement_status?: 'pending_calculation' | 'calculated' | 'approved' | 'paid';
}

const DEFAULT_CLEARANCE_ITEMS = [
  { department: 'IT' as const, item_name: 'Return Laptop' },
  { department: 'IT' as const, item_name: 'Revoke Email Access' },
  { department: 'Finance' as const, item_name: 'Clear Salary Advances' },
  { department: 'Finance' as const, item_name: 'Final Dues Calculation' },
  { department: 'Operations' as const, item_name: 'Return Uniform/PPE' },
];

export const useClearance = () => {
  const [loading, setLoading] = useState(false);
  const { tenant } = useTenant();
  const { toast } = useToast();

  const fetchClearance = async (employeeId: string): Promise<Clearance | null> => {
    try {
      const { data: clearance, error: clearanceError } = await supabase
        .from('offboarding_clearance')
        .select('*')
        .eq('employee_id', employeeId)
        .maybeSingle();

      if (clearanceError) throw clearanceError;
      if (!clearance) return null;

      const { data: items, error: itemsError } = await supabase
        .from('clearance_items')
        .select('*')
        .eq('clearance_id', clearance.id)
        .order('department', { ascending: true });

      if (itemsError) throw itemsError;

      return { ...clearance, items: (items as ClearanceItem[]) || [] } as Clearance;
    } catch (error: any) {
      console.error('Error fetching clearance:', error);
      return null;
    }
  };

  const initiateClearance = async (employeeId: string): Promise<Clearance | null> => {
    try {
      setLoading(true);

      // Check if clearance already exists
      const existing = await fetchClearance(employeeId);
      if (existing) {
        return existing;
      }

      // Create clearance record
      const { data: clearance, error: clearanceError } = await supabase
        .from('offboarding_clearance')
        .insert({
          employee_id: employeeId,
          tenant_id: tenant?.id,
          status: 'in_progress'
        })
        .select()
        .single();

      if (clearanceError) throw clearanceError;

      // Create default clearance items
      const itemsToInsert = DEFAULT_CLEARANCE_ITEMS.map(item => ({
        clearance_id: clearance.id,
        department: item.department,
        item_name: item.item_name,
        is_completed: false
      }));

      const { data: items, error: itemsError } = await supabase
        .from('clearance_items')
        .insert(itemsToInsert)
        .select();

      if (itemsError) throw itemsError;

      toast({
        title: 'Clearance Initiated',
        description: 'Departmental clearance checklist has been created.',
      });

      return { ...clearance, items: (items as ClearanceItem[]) || [] } as Clearance;
    } catch (error: any) {
      console.error('Error initiating clearance:', error);
      toast({
        title: 'Error',
        description: 'Failed to initiate clearance.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateClearanceItem = async (itemId: string, isCompleted: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('clearance_items')
        .update({
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
          completed_by: isCompleted ? user?.id : null
        })
        .eq('id', itemId);

      if (error) throw error;

      return { error: null };
    } catch (error: any) {
      console.error('Error updating clearance item:', error);
      toast({
        title: 'Error',
        description: 'Failed to update clearance item.',
        variant: 'destructive',
      });
      return { error };
    }
  };

  const completeClearance = async (clearanceId: string) => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('offboarding_clearance')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', clearanceId);

      if (error) throw error;

      toast({
        title: 'Clearance Completed',
        description: 'All clearance items have been processed.',
      });

      return { error: null };
    } catch (error: any) {
      console.error('Error completing clearance:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete clearance.',
        variant: 'destructive',
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    fetchClearance,
    initiateClearance,
    updateClearanceItem,
    completeClearance,
  };
};
