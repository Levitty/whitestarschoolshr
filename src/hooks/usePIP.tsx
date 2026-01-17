import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { useToast } from '@/hooks/use-toast';

export interface PIP {
  id: string;
  employee_id: string;
  tenant_id: string;
  area_of_deficiency: 'sales_target' | 'attendance' | 'conduct';
  expected_outcome: string;
  start_date: string;
  check_in_date: string;
  review_date: string;
  status: 'active' | 'completed' | 'terminated';
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePIPData {
  employee_id: string;
  area_of_deficiency: 'sales_target' | 'attendance' | 'conduct';
  expected_outcome: string;
  review_date: string;
}

export const usePIP = () => {
  const [loading, setLoading] = useState(false);
  const { tenant } = useTenant();
  const { toast } = useToast();

  const fetchEmployeePIP = async (employeeId: string): Promise<PIP | null> => {
    try {
      const { data, error } = await supabase
        .from('performance_improvement_plans')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;
      return data as PIP | null;
    } catch (error: any) {
      console.error('Error fetching PIP:', error);
      return null;
    }
  };

  const fetchAllActivePIPs = async (): Promise<PIP[]> => {
    try {
      const { data, error } = await supabase
        .from('performance_improvement_plans')
        .select('*')
        .eq('status', 'active');

      if (error) throw error;
      return (data as PIP[]) || [];
    } catch (error: any) {
      console.error('Error fetching PIPs:', error);
      return [];
    }
  };

  const createPIP = async (pipData: CreatePIPData) => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      const startDate = new Date();
      const checkInDate = new Date(startDate);
      checkInDate.setDate(checkInDate.getDate() + 15);

      const { error } = await supabase
        .from('performance_improvement_plans')
        .insert({
          employee_id: pipData.employee_id,
          tenant_id: tenant?.id,
          area_of_deficiency: pipData.area_of_deficiency,
          expected_outcome: pipData.expected_outcome,
          start_date: startDate.toISOString().split('T')[0],
          check_in_date: checkInDate.toISOString().split('T')[0],
          review_date: pipData.review_date,
          status: 'active',
          created_by: user?.id
        });

      if (error) throw error;

      toast({
        title: 'PIP Initiated',
        description: 'Performance Improvement Plan has been created.',
      });

      return { error: null };
    } catch (error: any) {
      console.error('Error creating PIP:', error);
      toast({
        title: 'Error',
        description: 'Failed to create PIP.',
        variant: 'destructive',
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const updatePIPStatus = async (pipId: string, status: 'active' | 'completed' | 'terminated', notes?: string) => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('performance_improvement_plans')
        .update({
          status,
          notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', pipId);

      if (error) throw error;

      toast({
        title: 'PIP Updated',
        description: `PIP status changed to ${status}.`,
      });

      return { error: null };
    } catch (error: any) {
      console.error('Error updating PIP:', error);
      toast({
        title: 'Error',
        description: 'Failed to update PIP.',
        variant: 'destructive',
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    fetchEmployeePIP,
    fetchAllActivePIPs,
    createPIP,
    updatePIPStatus,
  };
};
