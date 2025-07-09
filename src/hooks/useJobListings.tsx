
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
      const { data, error } = await supabase
        .from('job_listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
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
      const { data, error } = await supabase
        .from('job_listings')
        .insert([jobData])
        .select()
        .single();

      if (error) throw error;
      
      setJobListings(prev => [data as JobListing, ...prev]);
      toast({
        title: "Success",
        description: "Job posting created successfully"
      });
      
      return data;
    } catch (error) {
      console.error('Error creating job listing:', error);
      toast({
        title: "Error",
        description: "Failed to create job posting",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateJobListing = async (id: string, updates: Partial<JobListing>) => {
    try {
      const { data, error } = await supabase
        .from('job_listings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
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
      const { error } = await supabase
        .from('job_listings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
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
