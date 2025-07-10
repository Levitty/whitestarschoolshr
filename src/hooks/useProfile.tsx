
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  department: string | null;
  role: 'admin' | 'manager' | 'staff' | null;
  hire_date: string | null;
  employee_id: string | null;
  avatar_url: string | null;
  is_active: boolean;
  manager_id: string | null;
  job_title: string | null;
  salary_grade: string | null;
  direct_reports: number;
  created_at?: string | null;
  updated_at?: string | null;
}

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        const profileData: Profile = {
          id: data.id,
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone,
          department: data.department,
          role: data.role as 'admin' | 'manager' | 'staff',
          hire_date: data.hire_date,
          employee_id: data.employee_id,
          avatar_url: data.avatar_url,
          is_active: data.is_active,
          manager_id: null, // Set default value since it doesn't exist in profiles table
          job_title: null, // Set default value since it doesn't exist in profiles table
          salary_grade: null, // Set default value since it doesn't exist in profiles table
          direct_reports: 0, // Set default value since it doesn't exist in profiles table
          created_at: data.created_at,
          updated_at: data.updated_at
        };
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: 'No user found' };

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        return { error };
      }

      await fetchProfile();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const hasRole = (requiredRole: 'admin' | 'manager' | 'staff') => {
    if (!profile?.role) return false;
    
    const roleHierarchy = {
      admin: 3,
      manager: 2,
      staff: 1
    };
    
    return roleHierarchy[profile.role] >= roleHierarchy[requiredRole];
  };

  const canAccessAdmin = () => hasRole('admin');
  const canAccessManager = () => hasRole('manager');
  const isStaff = () => profile?.role === 'staff';

  return {
    profile,
    loading,
    fetchProfile,
    updateProfile,
    hasRole,
    canAccessAdmin,
    canAccessManager,
    isStaff
  };
};
