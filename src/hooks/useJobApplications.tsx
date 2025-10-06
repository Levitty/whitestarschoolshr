import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface JobApplication {
  id: string;
  job_id: string;
  candidate_name: string;
  candidate_email: string;
  phone_number?: string;
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
      console.log('=== CV UPLOAD START ===');
      console.log('File details:', { 
        fileName: file.name, 
        size: file.size, 
        type: file.type,
        jobId, 
        candidateName 
      });
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${jobId}/${candidateName.replace(/\s+/g, '_')}_${Date.now()}.${fileExt}`;
      
      console.log('Uploading to storage path:', fileName);
      
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

      console.log('Upload successful, data:', data);

      const { data: { publicUrl } } = supabase.storage
        .from('cv-uploads')
        .getPublicUrl(fileName);

      console.log('Public URL generated:', publicUrl);
      console.log('=== CV UPLOAD SUCCESS ===');
      
      return publicUrl;
    } catch (error) {
      console.error('=== CV UPLOAD FAILED ===');
      console.error('Error details:', error);
      throw error;
    }
  };

  const createApplication = async (applicationData: {
    job_id: string;
    candidate_name: string;
    candidate_email: string;
    phone_number?: string;
    cv_url?: string;
    note?: string;
  }) => {
    try {
      console.log('=== APPLICATION CREATION START ===');
      console.log('Application data:', applicationData);
      
      const insertData = {
        job_id: applicationData.job_id,
        candidate_name: applicationData.candidate_name,
        candidate_email: applicationData.candidate_email,
        phone_number: applicationData.phone_number || null,
        cv_url: applicationData.cv_url || null,
        note: applicationData.note || null,
        status: 'New' as const
      };
      
      console.log('Inserting data:', insertData);
      
      const { data, error } = await supabase
        .from('job_applications')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('=== DATABASE INSERT ERROR ===');
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
        console.error('Error hint:', error.hint);
        throw new Error(`Application submission failed: ${error.message}`);
      }
      
      if (!data) {
        console.error('No data returned from insert');
        throw new Error('No data returned from application creation');
      }
      
      console.log('Application created successfully:', data);
      console.log('=== APPLICATION CREATION SUCCESS ===');
      
      return data;
    } catch (error) {
      console.error('=== APPLICATION CREATION FAILED ===');
      console.error('Error details:', error);
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
        .select(`
          *,
          job_listings (
            title,
            department
          )
        `)
        .single();

      if (error) {
        console.error('Error updating application:', error);
        throw error;
      }
      
      console.log('Application updated successfully:', data);
      
      // Send interview notification email if status changed to Interview
      if (status === 'Interview' && data) {
        try {
          console.log('Sending interview notification email...');
          const { error: emailError } = await supabase.functions.invoke('send-interview-notification', {
            body: {
              candidateName: data.candidate_name,
              candidateEmail: data.candidate_email,
              position: data.job_listings?.title || 'Unknown Position',
              department: data.job_listings?.department || 'Unknown Department',
              note: note || data.note
            }
          });

          if (emailError) {
            console.error('Error sending interview notification:', emailError);
            toast({
              title: "Warning",
              description: "Status updated but failed to send notification email",
              variant: "destructive"
            });
          } else {
            console.log('Interview notification sent successfully');
          }
        } catch (emailError) {
          console.error('Error in email notification:', emailError);
        }
      }
      
      setApplications(prev => prev.map(app => 
        app.id === id ? { ...app, ...data } as JobApplication : app
      ));
      
      toast({
        title: "Success",
        description: status === 'Interview' 
          ? "Application updated and interview notification sent"
          : "Application status updated successfully"
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
