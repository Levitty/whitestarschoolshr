
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
      console.log('Fetching job applications...');
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

      if (error) {
        console.error('Error fetching applications:', error);
        throw error;
      }
      
      console.log('Applications fetched successfully:', data?.length || 0);
      setApplications((data || []) as JobApplication[]);
    } catch (error) {
      console.error('Error in fetchApplications:', error);
      toast({
        title: "Error",
        description: "Failed to load applications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadCV = async (file: File, jobId: string, candidateName: string) => {
    try {
      console.log('Starting CV upload:', { fileName: file.name, size: file.size, jobId, candidateName });
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${jobId}/${candidateName.replace(/\s+/g, '_')}_${Date.now()}.${fileExt}`;
      
      console.log('Uploading to path:', fileName);
      
      const { data, error: uploadError } = await supabase.storage
        .from('cv-uploads')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error(`CV upload failed: ${uploadError.message}`);
      }

      console.log('Upload successful:', data);

      const { data: { publicUrl } } = supabase.storage
        .from('cv-uploads')
        .getPublicUrl(fileName);

      console.log('CV uploaded successfully, public URL:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Error in uploadCV:', error);
      throw error;
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
      console.log('Creating application with data:', applicationData);
      
      // Create the application without authentication
      const { data, error } = await supabase
        .from('job_applications')
        .insert([{
          job_id: applicationData.job_id,
          candidate_name: applicationData.candidate_name,
          candidate_email: applicationData.candidate_email,
          cv_url: applicationData.cv_url || null,
          note: applicationData.note || null,
          status: 'New'
        }])
        .select()
        .single();

      if (error) {
        console.error('Supabase error creating application:', error);
        throw new Error(`Application creation failed: ${error.message}`);
      }
      
      console.log('Application created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error in createApplication:', error);
      throw error;
    }
  };

  const updateApplicationStatus = async (id: string, status: JobApplication['status'], note?: string) => {
    try {
      console.log('Updating application status:', { id, status, note });
      
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

      if (error) {
        console.error('Error updating application:', error);
        throw error;
      }
      
      console.log('Application updated successfully:', data);
      
      setApplications(prev => prev.map(app => 
        app.id === id ? { ...app, ...data } as JobApplication : app
      ));
      
      toast({
        title: "Success",
        description: "Application status updated successfully"
      });
      
      return data;
    } catch (error) {
      console.error('Error in updateApplicationStatus:', error);
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive"
      });
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
