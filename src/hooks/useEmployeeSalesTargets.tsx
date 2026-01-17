import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { useToast } from '@/hooks/use-toast';

export interface SalesTarget {
  id: string;
  employee_id: string;
  tenant_id: string;
  monthly_target: number;
  commission_rate: number;
  current_mtd_sales: number;
  created_at: string;
  updated_at: string;
}

export const useEmployeeSalesTargets = () => {
  const [loading, setLoading] = useState(false);
  const { tenant } = useTenant();
  const { toast } = useToast();

  const fetchSalesTarget = async (employeeId: string): Promise<SalesTarget | null> => {
    try {
      const { data, error } = await supabase
        .from('employee_sales_targets')
        .select('*')
        .eq('employee_id', employeeId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error fetching sales target:', error);
      return null;
    }
  };

  const upsertSalesTarget = async (
    employeeId: string,
    monthlyTarget: number,
    commissionRate: number,
    currentMtdSales?: number
  ) => {
    try {
      setLoading(true);
      
      const { data: existingTarget } = await supabase
        .from('employee_sales_targets')
        .select('id')
        .eq('employee_id', employeeId)
        .maybeSingle();

      if (existingTarget) {
        // Update existing
        const { error } = await supabase
          .from('employee_sales_targets')
          .update({
            monthly_target: monthlyTarget,
            commission_rate: commissionRate,
            current_mtd_sales: currentMtdSales ?? 0,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingTarget.id);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('employee_sales_targets')
          .insert({
            employee_id: employeeId,
            tenant_id: tenant?.id,
            monthly_target: monthlyTarget,
            commission_rate: commissionRate,
            current_mtd_sales: currentMtdSales ?? 0
          });

        if (error) throw error;
      }

      toast({
        title: 'Sales Target Updated',
        description: 'Performance settings saved successfully.',
      });

      return { error: null };
    } catch (error: any) {
      console.error('Error saving sales target:', error);
      toast({
        title: 'Error',
        description: 'Failed to save sales target.',
        variant: 'destructive',
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    fetchSalesTarget,
    upsertSalesTarget,
  };
};
