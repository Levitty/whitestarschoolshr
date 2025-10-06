
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
    location?: string;
    notes?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('interviews')
        .insert([{
          application_id: interviewData.application_id,
          interview_date: interviewData.interview_date,
          interviewer_name: interviewData.interviewer_name,
          interview_type: interviewData.interview_type
        }])
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
        .single();

      if (error) throw error;

      // Send interview notification email
      if (data) {
        try {
          console.log('Sending interview schedule notification...');
          const { error: emailError } = await supabase.functions.invoke('send-interview-schedule', {
            body: {
              candidateName: data.job_applications?.candidate_name,
              candidateEmail: data.job_applications?.candidate_email,
              position: data.job_applications?.job_listings?.title,
              department: data.job_applications?.job_listings?.department,
              interviewDate: interviewData.interview_date,
              interviewType: interviewData.interview_type,
              interviewerName: interviewData.interviewer_name,
              location: interviewData.location,
              notes: interviewData.notes
            }
          });

          if (emailError) {
            console.error('Error sending interview schedule email:', emailError);
          } else {
            console.log('Interview schedule notification sent successfully');
          }
        } catch (emailError) {
          console.error('Error in email notification:', emailError);
        }
      }
      
      await fetchInterviews(); // Refresh the list
      toast({
        title: "Success",
        description: "Interview scheduled and notification sent"
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
