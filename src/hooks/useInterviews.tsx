
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Interview {
  id: string;
  application_id: string;
  interview_date: string;
  interviewer_name: string;
  interview_type: 'Phone' | 'Physical' | 'Online';
  status: 'Scheduled' | 'Completed';
  feedback?: string;
  created_at: string;
  updated_at: string;
  job_applications?: {
    candidate_name: string;
    candidate_email: string;
    job_listings?: {
      title: string;
      department: string;
    };
  };
}

export const useInterviews = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchInterviews = async () => {
    try {
      const { data, error } = await supabase
        .from('interviews')
        .select(`
          *,
          job_applications (
            candidate_name,
            candidate_email,
            job_listings (
              title,
              department
            )
          )
        `)
        .order('interview_date', { ascending: true });

      if (error) throw error;
      setInterviews((data || []) as Interview[]);
    } catch (error) {
      console.error('Error fetching interviews:', error);
      toast({
        title: "Error",
        description: "Failed to load interviews",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createInterview = async (interviewData: {
    application_id: string;
    interview_date: string;
    interviewer_name: string;
    interview_type: 'Phone' | 'Physical' | 'Online';
  }) => {
    try {
      const { data, error } = await supabase
        .from('interviews')
        .insert([interviewData])
        .select()
        .single();

      if (error) throw error;
      
      await fetchInterviews(); // Refresh the list
      toast({
        title: "Success",
        description: "Interview scheduled successfully"
      });
      
      return data;
    } catch (error) {
      console.error('Error creating interview:', error);
      toast({
        title: "Error",
        description: "Failed to schedule interview",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateInterview = async (id: string, updates: Partial<Interview>) => {
    try {
      const { data, error } = await supabase
        .from('interviews')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setInterviews(prev => prev.map(interview => 
        interview.id === id ? { ...interview, ...data } as Interview : interview
      ));
      
      toast({
        title: "Success",
        description: "Interview updated successfully"
      });
      
      return data;
    } catch (error) {
      console.error('Error updating interview:', error);
      toast({
        title: "Error",
        description: "Failed to update interview",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  return {
    interviews,
    loading,
    createInterview,
    updateInterview,
    refetch: fetchInterviews
  };
};
