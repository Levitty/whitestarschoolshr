import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useTenant } from '@/contexts/TenantContext';

type EmployeeProfile = Database['public']['Tables']['employee_profiles']['Row'];
type EmployeeProfileInsert = Database['public']['Tables']['employee_profiles']['Insert'];
type Profile = Database['public']['Tables']['profiles']['Row'];

// Extended type that includes profile data
export type EmployeeWithProfile = EmployeeProfile & {
  profile_data?: Partial<Profile> | null;
};

export const useEmployees = () => {
  const [employees, setEmployees] = useState<EmployeeWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { tenant } = useTenant();

  useEffect(() => {
    fetchEmployees();
  }, [tenant?.id]);

  const fetchEmployees = async () => {
    try {
      // Only fetch if tenant is available
      if (!tenant?.id) {
        console.log('Skipping employees fetch - no tenant');
        setEmployees([]);
        setLoading(false);
        return;
      }
      
      console.log('Fetching employees for tenant:', tenant.id);
      const { data, error } = await supabase
        .from('employee_profiles')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching employees:', error);
        setLoading(false);
        return;
      }

      // Enrich with profile data for onboarding info
      const enrichedEmployees: EmployeeWithProfile[] = await Promise.all(
        (data || []).map(async (emp) => {
          if (emp.profile_id) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('id_number, kra_pin, sha_number, nssf_number, tsc_number, birth_date, gender, next_of_kin_name, next_of_kin_phone, next_of_kin_relationship, physical_address')
              .eq('id', emp.profile_id)
              .maybeSingle();
            
            return { ...emp, profile_data: profileData };
          }
          return { ...emp, profile_data: null };
        })
      );

      console.log('Fetched employees:', enrichedEmployees?.length || 0);
      setEmployees(enrichedEmployees);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const createEmployee = async (employeeData: Omit<EmployeeProfileInsert, 'employee_number'> & { employee_number?: string }) => {
    try {
      console.log('Creating employee with data:', employeeData);
      
      // Set contract end date based on contract duration
      let contractEndDate = null;
      if (employeeData.contract_start_date && employeeData.contract_duration_months) {
        const startDate = new Date(employeeData.contract_start_date);
        startDate.setMonth(startDate.getMonth() + employeeData.contract_duration_months);
        contractEndDate = startDate.toISOString().split('T')[0];
      }

      // Check if profile exists with this email and link it
      let profileId = null;
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', employeeData.email)
        .maybeSingle();

      if (existingProfile) {
        profileId = existingProfile.id;
        console.log('Linking to existing profile:', profileId);
      }

      // Create employee_profile - omit employee_number to let trigger generate it
      const { employee_number: _, ...dataWithoutEmployeeNumber } = employeeData;
      const finalEmployeeData: Omit<EmployeeProfileInsert, 'employee_number'> = {
        ...dataWithoutEmployeeNumber,
        profile_id: profileId,
        contract_end_date: contractEndDate,
        status: employeeData.status || 'active'
      };

      console.log('Final employee data:', finalEmployeeData);

      const { data, error } = await supabase
        .from('employee_profiles')
        .insert(finalEmployeeData as EmployeeProfileInsert)
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
      // Delete from employee_profiles only (keeps the user account)
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

  // Complete user deletion - removes from auth.users, profiles, and all related data
  const deleteUserCompletely = async (profileId: string) => {
    try {
      console.log('Initiating complete user deletion for profile:', profileId);
      
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { userId: profileId }
      });

      if (error) {
        console.error('Error calling delete-user function:', error);
        return { error };
      }

      if (data?.error) {
        console.error('Delete user function returned error:', data.error);
        return { error: { message: data.error } };
      }

      console.log('User completely deleted:', data);
      await fetchEmployees();
      return { error: null };
    } catch (error) {
      console.error('Error deleting user completely:', error);
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
    deleteEmployee,
    deleteUserCompletely
  };
};
