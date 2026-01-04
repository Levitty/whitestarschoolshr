import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Tenant, TenantWithStats } from '@/types/tenant';
import { toast } from 'sonner';

export const useSaasAdmin = () => {
  const { user } = useAuth();
  const [isSaasAdmin, setIsSaasAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSaasAdmin = async () => {
      if (!user) {
        setIsSaasAdmin(false);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('saas_admins')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      setIsSaasAdmin(!error && !!data);
      setLoading(false);
    };

    checkSaasAdmin();
  }, [user]);

  const fetchTenants = async (): Promise<TenantWithStats[]> => {
    const { data: tenants, error } = await supabase
      .from('tenants')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tenants:', error);
      return [];
    }

    // Fetch stats for each tenant
    const tenantsWithStats = await Promise.all(
      (tenants as unknown as Tenant[]).map(async (tenant) => {
        const { count: employeeCount } = await supabase
          .from('employee_profiles')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenant.id);

        const { count: userCount } = await supabase
          .from('tenant_users')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenant.id);

        return {
          ...tenant,
          employee_count: employeeCount || 0,
          user_count: userCount || 0
        };
      })
    );

    return tenantsWithStats;
  };

  const createTenant = async (data: {
    name: string;
    slug: string;
    subscription_tier: string;
    max_employees: number;
  }) => {
    const { data: tenant, error } = await supabase
      .from('tenants')
      .insert({
        name: data.name,
        slug: data.slug,
        subscription_tier: data.subscription_tier,
        max_employees: data.max_employees,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to create tenant: ' + error.message);
      throw error;
    }

    toast.success('Tenant created successfully');
    return tenant as unknown as Tenant;
  };

  const updateTenant = async (tenantId: string, data: Partial<Tenant>) => {
    const { error } = await supabase
      .from('tenants')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', tenantId);

    if (error) {
      toast.error('Failed to update tenant: ' + error.message);
      throw error;
    }

    toast.success('Tenant updated successfully');
  };

  const toggleTenantActive = async (tenantId: string, isActive: boolean) => {
    const { error } = await supabase
      .from('tenants')
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq('id', tenantId);

    if (error) {
      toast.error('Failed to update tenant status');
      throw error;
    }

    toast.success(isActive ? 'Tenant activated' : 'Tenant deactivated');
  };

  const getPlatformStats = async () => {
    const { count: totalTenants } = await supabase
      .from('tenants')
      .select('*', { count: 'exact', head: true });

    const { count: activeTenants } = await supabase
      .from('tenants')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    const { count: totalEmployees } = await supabase
      .from('employee_profiles')
      .select('*', { count: 'exact', head: true });

    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    return {
      totalTenants: totalTenants || 0,
      activeTenants: activeTenants || 0,
      totalEmployees: totalEmployees || 0,
      totalUsers: totalUsers || 0
    };
  };

  return {
    isSaasAdmin,
    loading,
    fetchTenants,
    createTenant,
    updateTenant,
    toggleTenantActive,
    getPlatformStats
  };
};
