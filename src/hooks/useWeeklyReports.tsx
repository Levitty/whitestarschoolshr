
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type WeeklyReport = Database['public']['Tables']['weekly_reports']['Row'];
type WeeklyReportInsert = Database['public']['Tables']['weekly_reports']['Insert'];

export const useWeeklyReports = () => {
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('weekly_reports')
        .select('*')
        .order('week_start_date', { ascending: false });

      if (error) {
        console.error('Error fetching reports:', error);
      } else {
        setReports(data || []);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const createReport = async (
    weekStartDate: string,
    weekEndDate: string,
    accomplishments: string,
    challenges?: string,
    nextWeekGoals?: string,
    hoursWorked?: number
  ) => {
    try {
      const reportData: WeeklyReportInsert = {
        week_start_date: weekStartDate,
        week_end_date: weekEndDate,
        accomplishments,
        challenges,
        next_week_goals: nextWeekGoals,
        hours_worked: hoursWorked
      };

      const { error } = await supabase
        .from('weekly_reports')
        .insert(reportData);

      if (error) {
        return { error };
      }

      await fetchReports();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const submitReport = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from('weekly_reports')
        .update({
          status: 'submitted',
          submitted_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (error) {
        return { error };
      }

      await fetchReports();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  return {
    reports,
    loading,
    fetchReports,
    createReport,
    submitReport
  };
};
