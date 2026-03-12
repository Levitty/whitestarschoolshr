import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/contexts/TenantContext';
import { supabase } from '@/integrations/supabase/client';
import { calculatePayroll, formatKES, getMonthName } from '@/utils/kenyanPayroll';

// Types for payroll (tables created via migration)
export interface PayrollRun {
  id: string;
  tenant_id: string;
  month: number;
  year: number;
  status: 'draft' | 'processing' | 'approved' | 'paid';
  total_gross: number;
  total_net: number;
  total_paye: number;
  total_shif: number;
  total_nssf: number;
  total_housing_levy: number;
  total_employer_cost: number;
  employee_count: number;
  created_by: string;
  approved_by: string | null;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PayrollItem {
  id: string;
  payroll_run_id: string;
  employee_id: string; // employee_profiles.id
  employee_name: string;
  employee_number: string | null;
  department: string | null;
  basic_salary: number;
  house_allowance: number;
  transport_allowance: number;
  overtime_allowance: number;
  other_allowances: number;
  gross_salary: number;
  taxable_income: number;
  paye: number;
  personal_relief: number;
  insurance_relief: number;
  net_paye: number;
  shif: number;
  nssf_tier_i: number;
  nssf_tier_ii: number;
  nssf_total: number;
  housing_levy: number;
  loan_repayment: number;
  sacco_contribution: number;
  union_dues: number;
  other_deductions: number;
  total_deductions: number;
  net_salary: number;
  employer_nssf: number;
  employer_housing_levy: number;
  total_employer_cost: number;
  tenant_id: string;
  created_at: string;
}

export interface EmployeeForPayroll {
  id: string;
  profile_id: string | null;
  first_name: string;
  last_name: string;
  employee_number: string | null;
  department: string | null;
  salary: number | null;
  status: string;
}

export const usePayroll = () => {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([]);
  const [currentPayrollItems, setCurrentPayrollItems] = useState<PayrollItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const tenantId = tenant?.id;

  // Fetch all payroll runs for tenant
  const fetchPayrollRuns = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('payroll_runs' as any)
        .select('*')
        .eq('tenant_id', tenantId)
        .order('year', { ascending: false })
        .order('month', { ascending: false });

      if (error) {
        console.error('Error fetching payroll runs:', error);
        setPayrollRuns([]);
      } else {
        setPayrollRuns((data as any) || []);
      }
    } catch (err) {
      console.error('Payroll fetch error:', err);
      setPayrollRuns([]);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  // Fetch payroll items for a specific run
  const fetchPayrollItems = useCallback(async (runId: string) => {
    try {
      const { data, error } = await supabase
        .from('payroll_items' as any)
        .select('*')
        .eq('payroll_run_id', runId)
        .order('employee_name', { ascending: true });

      if (error) {
        console.error('Error fetching payroll items:', error);
        return [];
      }
      setCurrentPayrollItems((data as any) || []);
      return (data as any) || [];
    } catch (err) {
      console.error('Payroll items fetch error:', err);
      return [];
    }
  }, []);

  // Get active employees for payroll processing
  const getEmployeesForPayroll = useCallback(async (): Promise<EmployeeForPayroll[]> => {
    if (!tenantId) return [];

    const { data, error } = await supabase
      .from('employee_profiles')
      .select('id, profile_id, first_name, last_name, employee_number, department, salary, status')
      .eq('tenant_id', tenantId)
      .eq('status', 'active');

    if (error) {
      console.error('Error fetching employees:', error);
      return [];
    }
    return data || [];
  }, [tenantId]);

  // Check if payroll already exists for a month/year
  const checkExistingPayroll = useCallback(async (month: number, year: number): Promise<PayrollRun | null> => {
    if (!tenantId) return null;

    const { data } = await supabase
      .from('payroll_runs' as any)
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('month', month)
      .eq('year', year)
      .maybeSingle();

    return (data as any) || null;
  }, [tenantId]);

  // Run payroll for a given month/year
  const runPayroll = useCallback(async (
    month: number,
    year: number,
    employeeOverrides?: Record<string, {
      houseAllowance?: number;
      transportAllowance?: number;
      overtimeAllowance?: number;
      otherAllowances?: number;
      loanRepayment?: number;
      saccoContribution?: number;
      unionDues?: number;
      otherDeductions?: number;
    }>
  ): Promise<{ success: boolean; runId?: string; error?: string }> => {
    if (!tenantId || !user) return { success: false, error: 'Not authenticated' };

    setProcessing(true);
    try {
      // Get employees
      const employees = await getEmployeesForPayroll();
      if (employees.length === 0) {
        return { success: false, error: 'No active employees found' };
      }

      // Calculate payroll for each employee
      const payrollItems: Omit<PayrollItem, 'id' | 'payroll_run_id' | 'created_at'>[] = [];
      let totalGross = 0, totalNet = 0, totalPaye = 0, totalShif = 0;
      let totalNssf = 0, totalHousingLevy = 0, totalEmployerCost = 0;

      for (const emp of employees) {
        const basicSalary = emp.salary || 0;
        if (basicSalary <= 0) continue; // Skip employees without salary

        const overrides = employeeOverrides?.[emp.id] || {};

        const result = calculatePayroll(basicSalary, {
          houseAllowance: overrides.houseAllowance || 0,
          transportAllowance: overrides.transportAllowance || 0,
          overtimeAllowance: overrides.overtimeAllowance || 0,
          otherAllowances: overrides.otherAllowances || 0,
        }, {
          loanRepayment: overrides.loanRepayment || 0,
          saccoContribution: overrides.saccoContribution || 0,
          unionDues: overrides.unionDues || 0,
          otherDeductions: overrides.otherDeductions || 0,
        });

        const item = {
          employee_id: emp.id,
          employee_name: `${emp.first_name} ${emp.last_name}`,
          employee_number: emp.employee_number,
          department: emp.department,
          basic_salary: basicSalary,
          house_allowance: overrides.houseAllowance || 0,
          transport_allowance: overrides.transportAllowance || 0,
          overtime_allowance: overrides.overtimeAllowance || 0,
          other_allowances: overrides.otherAllowances || 0,
          gross_salary: result.grossSalary,
          taxable_income: result.taxableIncome,
          paye: result.paye,
          personal_relief: result.personalRelief,
          insurance_relief: result.insuranceRelief,
          net_paye: result.netPaye,
          shif: result.shif,
          nssf_tier_i: result.nssfTierI,
          nssf_tier_ii: result.nssfTierII,
          nssf_total: result.nssfTotal,
          housing_levy: result.housingLevy,
          loan_repayment: overrides.loanRepayment || 0,
          sacco_contribution: overrides.saccoContribution || 0,
          union_dues: overrides.unionDues || 0,
          other_deductions: overrides.otherDeductions || 0,
          total_deductions: result.totalDeductions,
          net_salary: result.netSalary,
          employer_nssf: result.employerNssf,
          employer_housing_levy: result.employerHousingLevy,
          total_employer_cost: result.totalEmployerCost,
          tenant_id: tenantId,
        };

        payrollItems.push(item);
        totalGross += result.grossSalary;
        totalNet += result.netSalary;
        totalPaye += result.netPaye;
        totalShif += result.shif;
        totalNssf += result.nssfTotal;
        totalHousingLevy += result.housingLevy;
        totalEmployerCost += result.totalEmployerCost;
      }

      if (payrollItems.length === 0) {
        return { success: false, error: 'No employees with salary data found' };
      }

      // Create payroll run
      const { data: runData, error: runError } = await supabase
        .from('payroll_runs' as any)
        .insert({
          tenant_id: tenantId,
          month,
          year,
          status: 'draft',
          total_gross: Math.round(totalGross * 100) / 100,
          total_net: Math.round(totalNet * 100) / 100,
          total_paye: Math.round(totalPaye * 100) / 100,
          total_shif: Math.round(totalShif * 100) / 100,
          total_nssf: Math.round(totalNssf * 100) / 100,
          total_housing_levy: Math.round(totalHousingLevy * 100) / 100,
          total_employer_cost: Math.round(totalEmployerCost * 100) / 100,
          employee_count: payrollItems.length,
          created_by: user.id,
          notes: `Payroll for ${getMonthName(month)} ${year}`,
        })
        .select()
        .single();

      if (runError) {
        console.error('Error creating payroll run:', runError);
        return { success: false, error: runError.message };
      }

      const runId = (runData as any).id;

      // Insert payroll items
      const itemsToInsert = payrollItems.map(item => ({
        ...item,
        payroll_run_id: runId,
      }));

      const { error: itemsError } = await supabase
        .from('payroll_items' as any)
        .insert(itemsToInsert);

      if (itemsError) {
        console.error('Error creating payroll items:', itemsError);
        // Clean up the run
        await supabase.from('payroll_runs' as any).delete().eq('id', runId);
        return { success: false, error: itemsError.message };
      }

      await fetchPayrollRuns();
      return { success: true, runId };
    } catch (err: any) {
      console.error('Run payroll error:', err);
      return { success: false, error: err.message || 'Unknown error' };
    } finally {
      setProcessing(false);
    }
  }, [tenantId, user, getEmployeesForPayroll, fetchPayrollRuns]);

  // Approve payroll run
  const approvePayroll = useCallback(async (runId: string): Promise<boolean> => {
    if (!user) return false;

    const { error } = await supabase
      .from('payroll_runs' as any)
      .update({
        status: 'approved',
        approved_by: user.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', runId);

    if (error) {
      console.error('Error approving payroll:', error);
      return false;
    }
    await fetchPayrollRuns();
    return true;
  }, [user, fetchPayrollRuns]);

  // Mark payroll as paid
  const markAsPaid = useCallback(async (runId: string): Promise<boolean> => {
    const { error } = await supabase
      .from('payroll_runs' as any)
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', runId);

    if (error) {
      console.error('Error marking payroll as paid:', error);
      return false;
    }
    await fetchPayrollRuns();
    return true;
  }, [fetchPayrollRuns]);

  // Delete a draft payroll run
  const deletePayrollRun = useCallback(async (runId: string): Promise<boolean> => {
    // Delete items first
    await supabase.from('payroll_items' as any).delete().eq('payroll_run_id', runId);

    const { error } = await supabase
      .from('payroll_runs' as any)
      .delete()
      .eq('id', runId);

    if (error) {
      console.error('Error deleting payroll run:', error);
      return false;
    }
    await fetchPayrollRuns();
    return true;
  }, [fetchPayrollRuns]);

  useEffect(() => {
    if (tenantId) {
      fetchPayrollRuns();
    }
  }, [tenantId, fetchPayrollRuns]);

  return {
    payrollRuns,
    currentPayrollItems,
    loading,
    processing,
    fetchPayrollRuns,
    fetchPayrollItems,
    getEmployeesForPayroll,
    checkExistingPayroll,
    runPayroll,
    approvePayroll,
    markAsPaid,
    deletePayrollRun,
  };
};
