import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

export interface LoginAttempt {
  id: string;
  email: string;
  user_id: string | null;
  tenant_id: string | null;
  success: boolean;
  error_type: string | null;
  error_message: string | null;
  user_agent: string | null;
  created_at: string;
}

export const useLoginAudit = () => {
  const { tenant } = useTenant();

  const { data: loginAttempts, isLoading, refetch } = useQuery({
    queryKey: ['login-attempts', tenant?.id],
    queryFn: async () => {
      let query = supabase
        .from('login_attempts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (tenant?.id) {
        query = query.eq('tenant_id', tenant.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching login attempts:', error);
        throw error;
      }

      return data as LoginAttempt[];
    },
    enabled: !!tenant?.id,
  });

  return {
    loginAttempts: loginAttempts || [],
    isLoading,
    refetch,
  };
};

export const logLoginAttempt = async (
  email: string,
  success: boolean,
  errorType?: string,
  errorMessage?: string,
  userId?: string,
  tenantId?: string
) => {
  try {
    const { error } = await supabase
      .from('login_attempts')
      .insert({
        email,
        success,
        error_type: errorType || null,
        error_message: errorMessage || null,
        user_id: userId || null,
        tenant_id: tenantId || null,
        user_agent: navigator.userAgent,
      });

    if (error) {
      console.error('Failed to log login attempt:', error);
    }
  } catch (err) {
    console.error('Error logging login attempt:', err);
  }
};
