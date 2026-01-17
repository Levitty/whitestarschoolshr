import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

export interface SalesPerformance {
  id: string;
  employee_id: string;
  tenant_id: string;
  month: number;
  year: number;
  target_amount: number;
  actual_sales: number;
  commission_rate: number;
  status: 'on_track' | 'warning' | 'critical';
  notes: string | null;
  supporting_data: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface SalesPerformanceWithEmployee extends SalesPerformance {
  employee_profiles: {
    id: string;
    first_name: string;
    last_name: string;
    department: string;
    avatar_url: string | null;
    profile_id: string | null;
  };
}

const calculateStatus = (actual: number, target: number): 'on_track' | 'warning' | 'critical' => {
  if (target <= 0) return 'on_track';
  const achievement = (actual / target) * 100;
  if (achievement >= 80) return 'on_track';
  if (achievement >= 60) return 'warning';
  return 'critical';
};

const getMonthName = (month: number): string => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[month - 1] || '';
};

export const useSalesPerformance = () => {
  const [loading, setLoading] = useState(false);
  const { tenant } = useTenant();

  const fetchEmployeeSalesHistory = async (employeeId: string): Promise<SalesPerformance[]> => {
    setLoading(true);
    try {
      const now = new Date();
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      
      const { data, error } = await supabase
        .from('sales_performance')
        .select('*')
        .eq('employee_id', employeeId)
        .or(`and(year.gte.${sixMonthsAgo.getFullYear()},month.gte.${sixMonthsAgo.getMonth() + 1}),year.gt.${sixMonthsAgo.getFullYear()}`)
        .order('year', { ascending: true })
        .order('month', { ascending: true })
        .limit(6);

      if (error) throw error;
      return (data || []) as SalesPerformance[];
    } catch (error) {
      console.error('Error fetching sales history:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentMonthPerformance = async (employeeId: string): Promise<SalesPerformance | null> => {
    setLoading(true);
    try {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      const { data, error } = await supabase
        .from('sales_performance')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('month', currentMonth)
        .eq('year', currentYear)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as SalesPerformance | null;
    } catch (error) {
      console.error('Error fetching current month performance:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateSalesPerformance = async (
    id: string, 
    updates: { actual_sales?: number; notes?: string }
  ): Promise<{ error: Error | null }> => {
    setLoading(true);
    try {
      // First get the current record to calculate new status
      const { data: current, error: fetchError } = await supabase
        .from('sales_performance')
        .select('target_amount, actual_sales')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const newActualSales = updates.actual_sales ?? current.actual_sales;
      const newStatus = calculateStatus(newActualSales, current.target_amount);

      const { error } = await supabase
        .from('sales_performance')
        .update({
          ...updates,
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error updating sales performance:', error);
      return { error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  const createSalesPerformance = async (
    employeeId: string,
    month: number,
    year: number,
    targetAmount: number,
    commissionRate: number = 0.05
  ): Promise<{ data: SalesPerformance | null; error: Error | null }> => {
    setLoading(true);
    try {
      if (!tenant?.id) throw new Error('No tenant context');

      const { data, error } = await supabase
        .from('sales_performance')
        .insert({
          employee_id: employeeId,
          tenant_id: tenant.id,
          month,
          year,
          target_amount: targetAmount,
          actual_sales: 0,
          commission_rate: commissionRate,
          status: 'on_track'
        })
        .select()
        .single();

      if (error) throw error;
      return { data: data as SalesPerformance, error: null };
    } catch (error) {
      console.error('Error creating sales performance:', error);
      return { data: null, error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesTeamPerformance = async (): Promise<SalesPerformanceWithEmployee[]> => {
    setLoading(true);
    try {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      const { data, error } = await supabase
        .from('sales_performance')
        .select(`
          *,
          employee_profiles!inner (
            id,
            first_name,
            last_name,
            department,
            avatar_url,
            profile_id
          )
        `)
        .eq('month', currentMonth)
        .eq('year', currentYear);

      if (error) throw error;
      return (data || []) as unknown as SalesPerformanceWithEmployee[];
    } catch (error) {
      console.error('Error fetching sales team performance:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const checkPIPRecommendation = async (employeeId: string): Promise<boolean> => {
    try {
      const history = await fetchEmployeeSalesHistory(employeeId);
      
      if (history.length < 2) return false;

      // Get the last 2 records and check if both are below 70%
      const sortedHistory = history.sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      });

      const lastTwo = sortedHistory.slice(0, 2);
      
      const consecutiveBelowThreshold = lastTwo.every(record => {
        if (record.target_amount <= 0) return false;
        const achievement = (record.actual_sales / record.target_amount) * 100;
        return achievement < 70;
      });

      return consecutiveBelowThreshold;
    } catch (error) {
      console.error('Error checking PIP recommendation:', error);
      return false;
    }
  };

  const fetchLast3MonthsSalesData = async (employeeId: string): Promise<{ month: string; year: number; achievement: number }[]> => {
    try {
      const now = new Date();
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      
      const { data, error } = await supabase
        .from('sales_performance')
        .select('month, year, target_amount, actual_sales')
        .eq('employee_id', employeeId)
        .or(`and(year.gte.${threeMonthsAgo.getFullYear()},month.gte.${threeMonthsAgo.getMonth() + 1}),year.gt.${threeMonthsAgo.getFullYear()}`)
        .order('year', { ascending: true })
        .order('month', { ascending: true })
        .limit(3);

      if (error) throw error;

      return (data || []).map(record => ({
        month: getMonthName(record.month),
        year: record.year,
        achievement: record.target_amount > 0 
          ? Math.round((record.actual_sales / record.target_amount) * 100) 
          : 0
      }));
    } catch (error) {
      console.error('Error fetching last 3 months sales data:', error);
      return [];
    }
  };

  return {
    loading,
    fetchEmployeeSalesHistory,
    fetchCurrentMonthPerformance,
    updateSalesPerformance,
    createSalesPerformance,
    fetchSalesTeamPerformance,
    checkPIPRecommendation,
    fetchLast3MonthsSalesData
  };
};
