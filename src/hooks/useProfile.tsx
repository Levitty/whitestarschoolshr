
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
  role: 'superadmin' | 'head' | 'teacher' | 'staff' | null;
  hire_date: string | null;
  employee_id: string | null;
  avatar_url: string | null;
  is_active: boolean;
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
        setProfile(null);
      } else {
        const profileData: Profile = {
          id: data.id,
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone,
          department: data.department,
          role: data.role as 'superadmin' | 'head' | 'teacher' | 'staff',
          hire_date: data.hire_date,
          employee_id: data.employee_id,
          avatar_url: data.avatar_url,
          is_active: data.is_active,
          created_at: data.created_at,
          updated_at: data.updated_at
        };
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
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

  const hasRole = (requiredRole: 'superadmin' | 'head' | 'teacher' | 'staff') => {
    if (!profile?.role) return false;
    
    const roleHierarchy = {
      superadmin: 4,
      head: 3,
      teacher: 2,
      staff: 1
    };
    
    return roleHierarchy[profile.role] >= roleHierarchy[requiredRole];
  };

  const canAccessSuperAdmin = () => hasRole('superadmin');
  const canAccessHead = () => hasRole('head');
  const isTeacher = () => profile?.role === 'teacher';
  const isStaff = () => profile?.role === 'staff';

  return {
    profile,
    loading,
    fetchProfile,
    updateProfile,
    hasRole,
    canAccessSuperAdmin,
    canAccessHead,
    isTeacher,
    isStaff
  };
};
