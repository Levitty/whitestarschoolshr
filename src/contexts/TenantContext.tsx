import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tenant } from '@/types/tenant';
import { useAuth } from '@/hooks/useAuth';

interface TenantContextType {
  tenant: Tenant | null;
  tenants: Tenant[];
  loading: boolean;
  isSaasAdmin: boolean;
  switchTenant: (tenantId: string) => Promise<void>;
  refreshTenant: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

const SELECTED_TENANT_KEY = 'selected_tenant_id';

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaasAdmin, setIsSaasAdmin] = useState(false);

  const checkSaasAdmin = async () => {
    if (!user) return false;
    
    const { data, error } = await supabase
      .from('saas_admins')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();
    
    return !error && !!data;
  };

  const fetchTenants = async () => {
    if (!user) {
      setTenants([]);
      setTenant(null);
      setLoading(false);
      return;
    }

    try {
      const isSaas = await checkSaasAdmin();
      setIsSaasAdmin(isSaas);
      console.log('TenantContext: User:', user.email, 'isSaasAdmin:', isSaas);

      if (isSaas) {
        // SaaS admin can see all tenants
        const { data, error } = await supabase
          .from('tenants')
          .select('*')
          .order('name');
        
        if (!error && data) {
          // Cast to Tenant type
          const typedTenants = data as unknown as Tenant[];
          setTenants(typedTenants);
          
          // Try to restore previously selected tenant from localStorage
          const savedTenantId = localStorage.getItem(SELECTED_TENANT_KEY);
          const savedTenant = savedTenantId 
            ? typedTenants.find(t => t.id === savedTenantId) 
            : null;
          
          if (savedTenant) {
            console.log('TenantContext: Restored tenant from localStorage:', savedTenant.name, savedTenant.slug);
            setTenant(savedTenant);
          } else if (typedTenants.length > 0 && !tenant) {
            console.log('TenantContext: Using first tenant:', typedTenants[0].name, typedTenants[0].slug);
            setTenant(typedTenants[0]);
          }
        }
      } else {
        // Regular user can only see their tenant
        console.log('TenantContext: Fetching tenant_users for user:', user.id);
        const { data: tenantUsers, error: tuError } = await supabase
          .from('tenant_users')
          .select('tenant_id')
          .eq('user_id', user.id);
        
        console.log('TenantContext: tenant_users query result:', { tenantUsers, tuError });
        
        if (tuError) {
          console.error('TenantContext: Error fetching tenant_users:', tuError);
        }
        
        if (!tuError && tenantUsers && tenantUsers.length > 0) {
          const tenantIds = tenantUsers.map(tu => tu.tenant_id);
          console.log('TenantContext: Found tenant IDs:', tenantIds);
          
          const { data, error } = await supabase
            .from('tenants')
            .select('*')
            .in('id', tenantIds);
          
          console.log('TenantContext: tenants query result:', { data, error });
          
          if (!error && data) {
            const typedTenants = data as unknown as Tenant[];
            setTenants(typedTenants);
            console.log('TenantContext: Regular user tenants:', typedTenants.map(t => ({ name: t.name, slug: t.slug })));
            // Always set the first tenant for regular users (they typically have one)
            if (typedTenants.length > 0) {
              console.log('TenantContext: Setting tenant for regular user:', typedTenants[0].name, typedTenants[0].slug);
              setTenant(typedTenants[0]);
            }
          }
        } else {
          console.log('TenantContext: No tenant_users found for user');
        }
      }
    } catch (error) {
      console.error('Error fetching tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const switchTenant = async (tenantId: string) => {
    const selectedTenant = tenants.find(t => t.id === tenantId);
    if (selectedTenant) {
      setTenant(selectedTenant);
      // Persist selection for SaaS admins
      localStorage.setItem(SELECTED_TENANT_KEY, tenantId);
    }
  };

  const refreshTenant = async () => {
    await fetchTenants();
  };

  useEffect(() => {
    fetchTenants();
  }, [user]);

  return (
    <TenantContext.Provider value={{
      tenant,
      tenants,
      loading,
      isSaasAdmin,
      switchTenant,
      refreshTenant
    }}>
      {children}
    </TenantContext.Provider>
  );
};
