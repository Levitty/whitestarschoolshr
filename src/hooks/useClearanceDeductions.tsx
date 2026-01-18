import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { useToast } from '@/hooks/use-toast';

export type DeductionType = 'asset_not_returned' | 'asset_damaged' | 'advance_not_cleared' | 'leave_overdrawn' | 'other';

export interface ClearanceDeduction {
  id: string;
  clearance_id: string;
  tenant_id: string;
  description: string;
  amount: number;
  deduction_type: DeductionType;
  asset_id: string | null;
  created_by: string | null;
  created_at: string;
}

export interface SettlementData {
  outstanding_salary: number;
  leave_balance_payout: number;
  total_deductions: number;
  final_settlement_amount: number;
  settlement_status: 'pending_calculation' | 'calculated' | 'approved' | 'paid';
}

export const useClearanceDeductions = () => {
  const [loading, setLoading] = useState(false);
  const { tenant } = useTenant();
  const { toast } = useToast();

  const fetchClearanceDeductions = async (clearanceId: string): Promise<ClearanceDeduction[]> => {
    try {
      const { data, error } = await supabase
        .from('clearance_deductions')
        .select('*')
        .eq('clearance_id', clearanceId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data as unknown as ClearanceDeduction[]) || [];
    } catch (error: any) {
      console.error('Error fetching deductions:', error);
      return [];
    }
  };

  const addDeduction = async (
    clearanceId: string, 
    data: {
      description: string;
      amount: number;
      deduction_type: DeductionType;
      asset_id?: string;
    }
  ): Promise<ClearanceDeduction | null> => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      const { data: deduction, error } = await supabase
        .from('clearance_deductions')
        .insert({
          clearance_id: clearanceId,
          tenant_id: tenant?.id,
          description: data.description,
          amount: data.amount,
          deduction_type: data.deduction_type,
          asset_id: data.asset_id || null,
          created_by: user?.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Deduction Added',
        description: `Deduction of KES ${data.amount.toLocaleString()} added.`,
      });

      return deduction as unknown as ClearanceDeduction;
    } catch (error: any) {
      console.error('Error adding deduction:', error);
      toast({
        title: 'Error',
        description: 'Failed to add deduction.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const removeDeduction = async (deductionId: string): Promise<boolean> => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('clearance_deductions')
        .delete()
        .eq('id', deductionId);

      if (error) throw error;

      toast({
        title: 'Deduction Removed',
        description: 'The deduction has been removed.',
      });

      return true;
    } catch (error: any) {
      console.error('Error removing deduction:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove deduction.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const calculateSettlement = async (
    clearanceId: string,
    outstandingSalary: number,
    leaveBalancePayout: number
  ): Promise<SettlementData | null> => {
    try {
      setLoading(true);
      
      // Fetch all deductions
      const deductions = await fetchClearanceDeductions(clearanceId);
      const totalDeductions = deductions.reduce((sum, d) => sum + Number(d.amount), 0);
      const finalSettlement = outstandingSalary + leaveBalancePayout - totalDeductions;

      // Update the clearance with calculated values
      const { error } = await supabase
        .from('offboarding_clearance')
        .update({
          outstanding_salary: outstandingSalary,
          leave_balance_payout: leaveBalancePayout,
          total_deductions: totalDeductions,
          final_settlement_amount: finalSettlement,
          settlement_status: 'calculated',
          updated_at: new Date().toISOString()
        })
        .eq('id', clearanceId);

      if (error) throw error;

      toast({
        title: 'Settlement Calculated',
        description: `Net settlement: KES ${Math.abs(finalSettlement).toLocaleString()}`,
      });

      return {
        outstanding_salary: outstandingSalary,
        leave_balance_payout: leaveBalancePayout,
        total_deductions: totalDeductions,
        final_settlement_amount: finalSettlement,
        settlement_status: 'calculated'
      };
    } catch (error: any) {
      console.error('Error calculating settlement:', error);
      toast({
        title: 'Error',
        description: 'Failed to calculate settlement.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const approveSettlement = async (clearanceId: string): Promise<boolean> => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('offboarding_clearance')
        .update({
          settlement_status: 'approved',
          settlement_approved_by: user?.id,
          settlement_approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', clearanceId);

      if (error) throw error;

      toast({
        title: 'Settlement Approved',
        description: 'The final settlement has been approved.',
      });

      return true;
    } catch (error: any) {
      console.error('Error approving settlement:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve settlement.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const fetchSettlementData = async (clearanceId: string): Promise<SettlementData | null> => {
    try {
      const { data, error } = await supabase
        .from('offboarding_clearance')
        .select('outstanding_salary, leave_balance_payout, total_deductions, final_settlement_amount, settlement_status')
        .eq('id', clearanceId)
        .single();

      if (error) throw error;
      
      return data as unknown as SettlementData;
    } catch (error: any) {
      console.error('Error fetching settlement data:', error);
      return null;
    }
  };

  return {
    loading,
    fetchClearanceDeductions,
    addDeduction,
    removeDeduction,
    calculateSettlement,
    approveSettlement,
    fetchSettlementData,
  };
};
