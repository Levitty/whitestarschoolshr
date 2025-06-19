
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type RecruitmentAssessment = Database['public']['Tables']['recruitment_assessments']['Row'];
type RecruitmentAssessmentInsert = Database['public']['Tables']['recruitment_assessments']['Insert'];

export const useRecruitmentAssessments = () => {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<RecruitmentAssessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAssessments();
    }
  }, [user]);

  const fetchAssessments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('recruitment_assessments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching assessments:', error);
      } else {
        setAssessments(data || []);
      }
    } catch (error) {
      console.error('Error fetching assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAssessment = async (assessment: Omit<RecruitmentAssessmentInsert, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return { error: 'No user found' };

    try {
      const { error } = await supabase
        .from('recruitment_assessments')
        .insert({
          ...assessment,
          created_by: user.id
        });

      if (error) {
        return { error };
      }

      await fetchAssessments();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const updateAssessment = async (assessmentId: string, updates: Partial<RecruitmentAssessment>) => {
    if (!user) return { error: 'No user found' };

    try {
      const { error } = await supabase
        .from('recruitment_assessments')
        .update(updates)
        .eq('id', assessmentId);

      if (error) {
        return { error };
      }

      await fetchAssessments();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  return {
    assessments,
    loading,
    fetchAssessments,
    createAssessment,
    updateAssessment
  };
};
