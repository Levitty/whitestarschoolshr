
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type EmployeeProfile = Database['public']['Tables']['employee_profiles']['Row'];
type EmployeeProfileInsert = Database['public']['Tables']['employee_profiles']['Insert'];

export const useEmployees = () => {
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      console.log('Fetching employees...');
      const { data, error } = await supabase
        .from('employee_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching employees:', error);
      } else {
        console.log('Fetched employees:', data?.length || 0);
        setEmployees(data || []);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const createEmployee = async (employeeData: EmployeeProfileInsert) => {
    try {
      console.log('Creating employee with data:', employeeData);
      
      // Set contract end date based on contract duration
      let contractEndDate = null;
      if (employeeData.contract_start_date && employeeData.contract_duration_months) {
        const startDate = new Date(employeeData.contract_start_date);
        startDate.setMonth(startDate.getMonth() + employeeData.contract_duration_months);
        contractEndDate = startDate.toISOString().split('T')[0];
      }

      // Set default status if not provided
      const finalEmployeeData = {
        ...employeeData,
        contract_end_date: contractEndDate,
        status: employeeData.status || 'active'
      };

      console.log('Final employee data:', finalEmployeeData);

      const { data, error } = await supabase
        .from('employee_profiles')
        .insert(finalEmployeeData)
        .select()
        .single();

      if (error) {
        console.error('Error creating employee:', error);
        return { error };
      }

      console.log('Employee created successfully:', data);
      await fetchEmployees();
      return { error: null };
    } catch (error) {
      console.error('Unexpected error creating employee:', error);
      return { error };
    }
  };

  const updateEmployee = async (id: string, updates: Partial<EmployeeProfile>) => {
    try {
      const { error } = await supabase
        .from('employee_profiles')
        .update(updates)
        .eq('id', id);

      if (error) {
        return { error };
      }

      await fetchEmployees();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const getExpiringContracts = async () => {
    try {
      const { data, error } = await supabase
        .rpc('check_expiring_contracts');

      if (error) {
        console.error('Error fetching expiring contracts:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching expiring contracts:', error);
      return [];
    }
  };

  const inactivateEmployee = async (id: string) => {
    try {
      const { error } = await supabase
        .from('employee_profiles')
        .update({ status: 'inactive' })
        .eq('id', id);

      if (error) {
        return { error };
      }

      await fetchEmployees();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const deleteEmployee = async (id: string) => {
    try {
      // Delete from employee_profiles (cascade will handle related data)
      const { error } = await supabase
        .from('employee_profiles')
        .delete()
        .eq('id', id);

      if (error) {
        return { error };
      }

      await fetchEmployees();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  return {
    employees,
    loading,
    fetchEmployees,
    createEmployee,
    updateEmployee,
    getExpiringContracts,
    inactivateEmployee,
    deleteEmployee
  };
};
