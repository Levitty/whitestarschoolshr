
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface JobApplication {
  id: string;
  job_id: string;
  candidate_name: string;
  candidate_email: string;
  cv_url?: string;
  note?: string;
  status: 'New' | 'Interview' | 'Rejected' | 'Hired';
  applied_at: string;
  updated_at: string;
  job_listings?: {
    title: string;
    department: string;
  };
}

export const useJobApplications = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          job_listings (
            title,
            department
          )
        `)
        .order('applied_at', { ascending: false });

      if (error) throw error;
      setApplications((data || []) as JobApplication[]);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: "Error",
        description: "Failed to load applications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createApplication = async (applicationData: {
    job_id: string;
    candidate_name: string;
    candidate_email: string;
    cv_url?: string;
    note?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .insert([applicationData])
        .select()
        .single();

      if (error) throw error;
      
      await fetchApplications(); // Refresh the list
      toast({
        title: "Success",
        description: "Application submitted successfully"
      });
      
      return data;
    } catch (error) {
      console.error('Error creating application:', error);
      toast({
        title: "Error",
        description: "Failed to submit application",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateApplicationStatus = async (id: string, status: JobApplication['status'], note?: string) => {
    try {
      const updateData: any = { status };
      if (note !== undefined) {
        updateData.note = note;
      }

      const { data, error } = await supabase
        .from('job_applications')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setApplications(prev => prev.map(app => app.id === id ? { ...app, ...data } as JobApplication : app));
      toast({
        title: "Success",
        description: "Application status updated successfully"
      });
      
      return data;
    } catch (error) {
      console.error('Error updating application:', error);
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive"
      });
      throw error;
    }
  };

  const uploadCV = async (file: File, applicationId: string) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${applicationId}/cv.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('cv-uploads')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('cv-uploads')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading CV:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  return {
    applications,
    loading,
    createApplication,
    updateApplicationStatus,
    uploadCV,
    refetch: fetchApplications
  };
};
