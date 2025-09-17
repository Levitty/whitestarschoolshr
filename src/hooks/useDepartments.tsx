import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

type Department = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export const useDepartments = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching departments:', error);
      } else {
        setDepartments(data || []);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDepartment = async (name: string, description?: string) => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .insert({ name, description })
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