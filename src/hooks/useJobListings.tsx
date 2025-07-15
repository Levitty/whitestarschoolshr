
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface JobListing {
  id: string;
  title: string;
  description: string;
  department: string;
  location: string;
  employment_type: 'Full-time' | 'Part-time' | 'Contract';
  status: 'Open' | 'Closed';
  created_at: string;
  updated_at: string;
}

export const useJobListings = () => {
  const [jobListings, setJobListings] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchJobListings = async () => {
    try {
      console.log('Fetching job listings...');
      
      // Get current user to check permissions
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user for job listings fetch:', user);

      const { data, error } = await supabase
        .from('job_listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching job listings:', error);
        throw error;
      }
      
      console.log('Job listings fetched successfully:', data);
      setJobListings((data || []) as JobListing[]);
    } catch (error) {
      console.error('Error fetching job listings:', error);
      toast({
        title: "Error",
        description: "Failed to load job listings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createJobListing = async (jobData: Omit<JobListing, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('Creating job listing with data:', jobData);
      
      // Check authentication first
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('Authentication error:', authError);
        throw new Error('You must be logged in to create job postings');
      }

      // Check user role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        throw new Error('Unable to verify user permissions');
      }

      if (profile?.role !== 'admin' && profile?.role !== 'superadmin') {
        console.error('User does not have admin permissions:', profile?.role);
        throw new Error('Only administrators can create job postings');
      }

      console.log('User has admin permissions, proceeding with job creation');
      
      const { data, error } = await supabase
        .from('job_listings')
        .insert([jobData])
        .select()
        .single();

      if (error) {
        console.error('Supabase error creating job listing:', error);
        throw new Error(error.message || 'Failed to create job posting');
      }
      
      console.log('Job listing created successfully:', data);
      setJobListings(prev => [data as JobListing, ...prev]);
      
      return data;
    } catch (error) {
      console.error('Error in createJobListing:', error);
      throw error; // Re-throw so the component can handle it
    }
  };

  const updateJobListing = async (id: string, updates: Partial<JobListing>) => {
    try {
      console.log('Updating job listing:', id, updates);
      
      const { data, error } = await supabase
        .from('job_listings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating job listing:', error);
        throw error;
      }
      
      console.log('Job listing updated successfully:', data);
      setJobListings(prev => prev.map(job => job.id === id ? data as JobListing : job));
      toast({
        title: "Success",
        description: "Job posting updated successfully"
      });
      
      return data;
    } catch (error) {
      console.error('Error updating job listing:', error);
      toast({
        title: "Error",
        description: "Failed to update job posting",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteJobListing = async (id: string) => {
    try {
      console.log('Deleting job listing:', id);
      
      const { error } = await supabase
        .from('job_listings')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting job listing:', error);
        throw error;
      }
      
      console.log('Job listing deleted successfully');
      setJobListings(prev => prev.filter(job => job.id !== id));
      toast({
        title: "Success",
        description: "Job posting deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting job listing:', error);
      toast({
        title: "Error",
        description: "Failed to delete job posting",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchJobListings();
  }, []);

  return {
    jobListings,
    loading,
    createJobListing,
    updateJobListing,
    deleteJobListing,
    refetch: fetchJobListings
  };
};
