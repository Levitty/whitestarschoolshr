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

// Map custom domains to tenant slugs
const getDomainTenantSlug = (): string | null => {
  const hostname = window.location.hostname.toLowerCase();
  
  const domainToTenant: Record<string, string> = {
    'hr.whitestarschools.com': 'whitestar-schools',
    'www.hr.whitestarschools.com': 'whitestar-schools',
  };
  
  return domainToTenant[hostname] || null;
};

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaasAdmin, setIsSaasAdmin] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const checkSaasAdmin = async () => {
    if (!user) return false;
    
    const { data, error } = await supabase
      .from('saas_admins')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();
    
    return !error && !!data;
  };

  // Fallback: fetch tenant by custom domain slug
  const fetchTenantByDomain = async (): Promise<Tenant | null> => {
    const slug = getDomainTenantSlug();
    if (!slug) return null;
    
    console.log('TenantContext: Attempting domain-based tenant lookup for slug:', slug);
    
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle();
    
    if (!error && data) {
      console.log('TenantContext: Found tenant via domain lookup:', data.name);
      return data as unknown as Tenant;
    }
    
    return null;
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
        // Regular user - first try tenant_users, then fallback to profiles.tenant_id
        console.log('TenantContext: Fetching tenant for regular user:', user.id);
        
        let tenantId: string | null = null;
        
        // First, try tenant_users table
        const { data: tenantUsers, error: tuError } = await supabase
          .from('tenant_users')
          .select('tenant_id')
          .eq('user_id', user.id);
        
        console.log('TenantContext: tenant_users query result:', { tenantUsers, tuError });
        
        if (!tuError && tenantUsers && tenantUsers.length > 0) {
          tenantId = tenantUsers[0].tenant_id;
          console.log('TenantContext: Found tenant_id from tenant_users:', tenantId);
        }
        
        // Fallback: check profiles.tenant_id if no tenant_users entry
        if (!tenantId) {
          console.log('TenantContext: No tenant_users, checking profiles.tenant_id');
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('tenant_id')
            .eq('id', user.id)
            .maybeSingle();
          
          console.log('TenantContext: profile query result:', { profile, profileError });
          
          if (!profileError && profile?.tenant_id) {
            tenantId = profile.tenant_id;
            console.log('TenantContext: Found tenant_id from profiles:', tenantId);
          }
        }
        
        // Fetch the tenant if we have an ID
        if (tenantId) {
          const { data, error } = await supabase
            .from('tenants')
            .select('*')
            .eq('id', tenantId)
            .maybeSingle();
          
          console.log('TenantContext: tenant query result:', { data, error });
          
          if (!error && data) {
            const typedTenant = data as unknown as Tenant;
            setTenants([typedTenant]);
            setTenant(typedTenant);
            console.log('TenantContext: Setting tenant for regular user:', typedTenant.name, typedTenant.slug);
          } else {
            // If tenant fetch failed, try domain-based lookup
            const domainTenant = await fetchTenantByDomain();
            if (domainTenant) {
              setTenants([domainTenant]);
              setTenant(domainTenant);
            }
          }
        } else {
          // No tenant_id found, try domain-based lookup as last resort
          console.log('TenantContext: No tenant_id found for user, trying domain lookup');
          const domainTenant = await fetchTenantByDomain();
          if (domainTenant) {
            setTenants([domainTenant]);
            setTenant(domainTenant);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching tenants:', error);
      // On error, try domain-based lookup
      const domainTenant = await fetchTenantByDomain();
      if (domainTenant) {
        setTenants([domainTenant]);
        setTenant(domainTenant);
      }
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
    setRetryCount(prev => prev + 1);
    await fetchTenants();
  };

  useEffect(() => {
    fetchTenants();
  }, [user, retryCount]);

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
