
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
      const { data, error } = await supabase
        .from('employee_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching employees:', error);
      } else {
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
      const { error } = await supabase
        .from('employee_profiles')
        .insert(employeeData);

      if (error) {
        return { error };
      }

      await fetchEmployees();
      return { error: null };
    } catch (error) {
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

  return {
    employees,
    loading,
    fetchEmployees,
    createEmployee,
    updateEmployee
  };
};
