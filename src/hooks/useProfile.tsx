
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  department: string | null;
  role: 'superadmin' | 'head' | 'teacher' | 'staff';
  status: 'pending' | 'active';
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: 'No user found' };

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id);

      if (error) {
        return { error };
      }

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

  const canAccessAdmin = () => hasRole('superadmin');
  const canAccessDepartment = () => hasRole('head');
  const isTeacher = () => profile?.role === 'teacher';
  const isStaff = () => profile?.role === 'staff';

  return {
    profile,
    loading,
    updateProfile,
    hasRole,
    canAccessAdmin,
    canAccessDepartment,
    isTeacher,
    isStaff
  };
};
