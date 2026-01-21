import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

type Department = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export const useDepartments = (tenantId?: string) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDepartments();
  }, [tenantId]);

  const fetchDepartments = async () => {
    try {
      // If tenantId is provided, use it to filter departments
      // This works for both authenticated and unauthenticated users (e.g., signup page)
      if (!tenantId) {
        // No tenant context - can't fetch departments without a tenant
        setDepartments([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('departments')
        .select('id, name, description, created_at, updated_at')
        .eq('tenant_id', tenantId)
        .order('name');

      if (error) {
        console.error('Error fetching departments:', error);
        // For signup, if RLS blocks the query, we might need a fallback
        setDepartments([]);
      } else {
        setDepartments(data || []);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  const createDepartment = async (name: string, description?: string) => {
    try {
      const insertData: { name: string; description?: string; tenant_id?: string } = { name, description };
      
      // Include tenant_id if provided
      if (tenantId) {
        insertData.tenant_id = tenantId;
      }
      
      const { data, error } = await supabase
        .from('departments')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        return { error };
      }

      await fetchDepartments();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const deleteDepartment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', id);

      if (error) {
        return { error };
      }

      await fetchDepartments();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  return {
    departments,
    loading,
    fetchDepartments,
    createDepartment,
    deleteDepartment
  };
};