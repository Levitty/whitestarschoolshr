import { useState, useEffect, createContext, useContext } from 'react';
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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

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
      avatar_url: data.avatar_url,
      phone: data.phone,
      employee_id: data.employee_id,
      hire_date: data.hire_date,
      is_active: data.is_active,
      status: data.status || 'pending',
      created_at: data.created_at,
      updated_at: data.updated_at
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

  const signUp = async (email: string, password: string, fullName: string, department: string, role: UserRole) => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: fullName,
          department: department,
          role: role
        }
      }
    });
    setLoading(false);
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    setLoading(false);
    return { error };
  };

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setLoading(false);
    window.location.href = '/auth';
  };

  useEffect(() => {
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
    };

    getSession();
    return () => subscription.unsubscribe();
  }, []);

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
