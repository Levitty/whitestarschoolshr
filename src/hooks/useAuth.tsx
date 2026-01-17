import React, { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile, AuthContextType, UserRole } from '@/types/auth';
import { normalizeRole } from '@/utils/roleUtils';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('AuthProvider starting to initialize...');
  
  // Test if basic useState works
  const [user, setUser] = React.useState<User | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [loading, setLoading] = React.useState(true);

  console.log('AuthProvider useState calls successful');

  const transformProfileData = (data: any): Profile => {
    const normalizedRole = normalizeRole(data.role);
    console.log('Raw role from DB:', data.role, '-> Normalized role:', normalizedRole);
    
    return {
      id: data.id,
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      full_name: data.first_name && data.last_name ? `${data.first_name} ${data.last_name}` : data.first_name || data.last_name || null,
      department: data.department,
      role: normalizedRole,
      branch: data.branch,
      avatar_url: data.avatar_url,
      phone: data.phone,
      employee_id: data.employee_id,
      hire_date: data.hire_date,
      is_active: data.is_active,
      status: data.status || 'pending',
      created_at: data.created_at,
      updated_at: data.updated_at,
      // Onboarding fields
      id_number: data.id_number,
      kra_pin: data.kra_pin,
      birth_date: data.birth_date,
      gender: data.gender,
      sha_number: data.sha_number,
      nssf_number: data.nssf_number,
      tsc_number: data.tsc_number,
      next_of_kin_name: data.next_of_kin_name,
      next_of_kin_phone: data.next_of_kin_phone,
      next_of_kin_relationship: data.next_of_kin_relationship,
      physical_address: data.physical_address,
      onboarding_completed: data.onboarding_completed
    };
  };

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      console.log('Fetching fresh profile for user:', user.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        setProfile(null);
      } else {
        console.log('Fresh profile fetched successfully:', data);
        const transformedProfile = transformProfileData(data);
        console.log('Transformed profile with role:', transformedProfile.role);
        setProfile(transformedProfile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    }
  };

  const hasRole = (requiredRole: UserRole): boolean => {
    if (!profile?.role) return false;
    const normalizedUserRole = normalizeRole(profile.role);
    const normalizedRequiredRole = normalizeRole(requiredRole);
    return normalizedUserRole === normalizedRequiredRole;
  };

  const isSuperAdmin = (): boolean => {
    return hasRole('superadmin');
  };

  const refreshSession = async () => {
    try {
      console.log('Refreshing session...');
      const { data: { session }, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Error refreshing session:', error);
      } else {
        console.log('Session refreshed successfully');
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(async () => {
            await fetchProfile();
          }, 0);
        }
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, department: string, role: UserRole, branch?: string) => {
    setLoading(true);
    
    try {
      // For superadmin accounts, create them directly as confirmed users
      if (role === 'superadmin') {
        console.log('Creating superadmin account...');
        
        // Create superadmin user with email already confirmed and active status
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: fullName,
              first_name: fullName.split(' ')[0],
              last_name: fullName.split(' ').slice(1).join(' ') || '',
              department: department,
              role: role,
              branch: branch || null,
              is_superadmin: true // Flag to identify superadmin during profile creation
            }
          }
        });

        if (authError) {
          console.error('Error creating superadmin:', authError);
          setLoading(false);
          return { error: authError };
        }

        console.log('Superadmin signup initiated:', authData.user?.email);
        
        // For superadmin, we'll handle the confirmation in the trigger
        setLoading(false);
        return { error: null };
      } else {
        // Regular user signup (requires email confirmation)
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: fullName,
              first_name: fullName.split(' ')[0],
              last_name: fullName.split(' ').slice(1).join(' ') || '',
              department: department,
              role: role,
              branch: branch || null
            }
          }
        });

        setLoading(false);
        return { error };
      }
    } catch (error) {
      console.error('Signup error:', error);
      setLoading(false);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('Attempting sign in for:', email);
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.log('Sign in error:', error);
        setLoading(false);
        return { error };
      }
      
      // Check if user profile is approved
      if (data.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('status, is_active')
          .eq('id', data.user.id)
          .single();
        
        if (profileError) {
          console.error('Error fetching profile:', profileError);
          await supabase.auth.signOut();
          setLoading(false);
          return { 
            error: { 
              message: 'Unable to verify account status. Please try again.',
              name: 'ProfileError',
              status: 500
            } 
          };
        }
        
        // Block sign-in if account is not active or approved
        if (profileData.status === 'pending' || !profileData.is_active) {
          await supabase.auth.signOut();
          setLoading(false);
          return { 
            error: { 
              message: 'Your account is pending approval. Please wait for a super admin to activate your account.',
              name: 'AccountNotApproved',
              status: 403
            } 
          };
        }
        
        if (profileData.status === 'inactive' || profileData.status === 'suspended') {
          await supabase.auth.signOut();
          setLoading(false);
          return { 
            error: { 
              message: 'Your account has been deactivated. Please contact an administrator.',
              name: 'AccountDeactivated',
              status: 403
            } 
          };
        }
      }
      
      console.log('Sign in successful:', data.user?.email);
      setLoading(false);
      return { error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      setLoading(false);
      return { error };
    }
  };

  const signOut = async () => {
    setLoading(true);
    
    // Clear state first
    setUser(null);
    setSession(null);
    setProfile(null);
    
    // Clear any localStorage tenant selection
    localStorage.removeItem('selected_tenant_id');
    
    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      if (error) {
        console.error('Sign out error:', error);
      }
    } catch (error) {
      console.error('Sign out error:', error);
    }
    
    setLoading(false);
    
    // Force a full page reload to clear all cached state
    window.location.replace('/auth');
  };

  React.useEffect(() => {
    console.log('Setting up auth state listener...');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          setTimeout(async () => {
            try {
              console.log('Fetching profile after auth state change...');
              const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

              if (error) {
                console.error('Error fetching profile:', error);
                setProfile(null);
              } else {
                console.log('Profile data received:', data);
                const transformedProfile = transformProfileData(data);
                console.log('Setting profile with role:', transformedProfile.role);
                setProfile(transformedProfile);
              }
            } catch (error) {
              console.error('Error fetching profile:', error);
              setProfile(null);
            }
          }, 0);
        } else if (!session?.user) {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    const getSession = async () => {
      try {
        console.log('Getting initial session...');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Initial session:', session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(async () => {
            try {
              console.log('Fetching initial profile...');
              const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

              if (error) {
                console.error('Error fetching profile:', error);
                setProfile(null);
              } else {
                console.log('Initial profile data:', data);
                const transformedProfile = transformProfileData(data);
                console.log('Initial profile role:', transformedProfile.role);
                setProfile(transformedProfile);
              }
            } catch (error) {
              console.error('Error fetching profile:', error);
              setProfile(null);
            }
          }, 0);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error getting session:', error);
        setLoading(false);
      }
    };

    getSession();
    return () => subscription.unsubscribe();
  }, []);

  console.log('AuthProvider about to render context...');

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      signUp,
      signIn,
      signOut,
      fetchProfile,
      refreshSession,
      hasRole,
      isSuperAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
};