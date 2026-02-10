import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTenant } from '@/contexts/TenantContext';

export interface ManagementReport {
  id: string;
  tenant_id: string;
  report_period_start: string;
  report_period_end: string;
  total_headcount: number;
  new_hires: number;
  terminations: number;
  pending_approvals: number;
  active_clearances: number;
  leave_requests_submitted: number;
  leave_requests_approved: number;
  leave_requests_rejected: number;
  leave_requests_pending: number;
  total_leave_days_taken: number;
  evaluations_completed: number;
  evaluations_pending: number;
  active_pips: number;
  tickets_opened: number;
  tickets_resolved: number;
  tickets_pending: number;
  open_positions: number;
  new_applications: number;
  interviews_scheduled: number;
  report_summary: string | null;
  report_data: any;
  email_sent: boolean;
  email_sent_at: string | null;
  email_recipients: string[] | null;
  status: string;
  created_at: string;
}

export const useManagementReports = () => {
  const [reports, setReports] = useState<ManagementReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();
  const { tenant } = useTenant();

  const fetchReports = async () => {
    if (!tenant) return;
    try {
      const { data, error } = await supabase
        .from('weekly_management_reports')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('report_period_start', { ascending: false })
        .limit(20);

      if (error) throw error;
      setReports((data as unknown as ManagementReport[]) || []);
    } catch (error) {
      console.error('Error fetching management reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [tenant]);

  const generateReport = async () => {
    if (!tenant) return;
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-weekly-report', {
        body: { tenant_id: tenant.id },
      });

      if (error) throw error;

      toast({
        title: 'Report Generated',
        description: 'Weekly management report has been generated and emailed to admins.',
      });

      await fetchReports();
    } catch (error: any) {
      console.error('Error generating report:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate weekly report.',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  return { reports, loading, generating, generateReport, fetchReports };
};
