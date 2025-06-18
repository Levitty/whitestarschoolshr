
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type InterviewRecord = Database['public']['Tables']['interview_records']['Row'];
type InterviewRecordInsert = Database['public']['Tables']['interview_records']['Insert'];

export const useInterviews = () => {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState<InterviewRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchInterviews();
    }
  }, [user]);

  const fetchInterviews = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('interview_records')
        .select('*')
        .order('interview_date', { ascending: false });

      if (error) {
        console.error('Error fetching interviews:', error);
      } else {
        setInterviews(data || []);
      }
    } catch (error) {
      console.error('Error fetching interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const createInterview = async (
    candidateName: string,
    candidateEmail: string,
    position: string,
    interviewDate: string,
    interviewType: string
  ) => {
    if (!user) return { error: 'No user found' };

    try {
      const interviewData: InterviewRecordInsert = {
        candidate_name: candidateName,
        candidate_email: candidateEmail,
        position,
        interview_date: interviewDate,
        interviewer_id: user.id,
        interview_type: interviewType as any
      };

      const { error } = await supabase
        .from('interview_records')
        .insert(interviewData);

      if (error) {
        return { error };
      }

      await fetchInterviews();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const updateInterview = async (
    interviewId: string,
    updates: Partial<InterviewRecord>
  ) => {
    if (!user) return { error: 'No user found' };

    try {
      const { error } = await supabase
        .from('interview_records')
        .update(updates)
        .eq('id', interviewId);

      if (error) {
        return { error };
      }

      await fetchInterviews();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  return {
    interviews,
    loading,
    fetchInterviews,
    createInterview,
    updateInterview
  };
};
