import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

type Branch = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export const useBranches = (tenantId?: string) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBranches();
  }, [tenantId]);

  const fetchBranches = async () => {
    try {
      if (!tenantId) {
        setBranches([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('branches')
        .select('id, name, description, created_at, updated_at')
        .eq('tenant_id', tenantId)
        .order('name');

      if (error) {
        console.error('Error fetching branches:', error);
        setBranches([]);
      } else {
        setBranches(data || []);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
      setBranches([]);
    } finally {
      setLoading(false);
    }
  };

  const createBranch = async (name: string, description?: string) => {
    try {
      if (!tenantId) {
        return { error: new Error('Tenant ID is required') };
      }
      
      const { data, error } = await supabase
        .from('branches')
        .insert({
          name,
          description: description || null,
          tenant_id: tenantId
        })
        .select()
        .single();

      if (error) {
        return { error };
      }

      await fetchBranches();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const deleteBranch = async (id: string) => {
    try {
      const { error } = await supabase
        .from('branches')
        .delete()
        .eq('id', id);

      if (error) {
        return { error };
      }

      await fetchBranches();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  return {
    branches,
    loading,
    fetchBranches,
    createBranch,
    deleteBranch
  };
};
