
-- Table to store auto-generated weekly management reports
CREATE TABLE public.weekly_management_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  report_period_start DATE NOT NULL,
  report_period_end DATE NOT NULL,
  
  -- HR Summary metrics
  total_headcount INTEGER DEFAULT 0,
  new_hires INTEGER DEFAULT 0,
  terminations INTEGER DEFAULT 0,
  pending_approvals INTEGER DEFAULT 0,
  active_clearances INTEGER DEFAULT 0,
  
  -- Leave & Attendance metrics
  leave_requests_submitted INTEGER DEFAULT 0,
  leave_requests_approved INTEGER DEFAULT 0,
  leave_requests_rejected INTEGER DEFAULT 0,
  leave_requests_pending INTEGER DEFAULT 0,
  total_leave_days_taken NUMERIC(6,1) DEFAULT 0,
  
  -- Performance metrics
  evaluations_completed INTEGER DEFAULT 0,
  evaluations_pending INTEGER DEFAULT 0,
  active_pips INTEGER DEFAULT 0,
  
  -- Tasks & Tickets
  tickets_opened INTEGER DEFAULT 0,
  tickets_resolved INTEGER DEFAULT 0,
  tickets_pending INTEGER DEFAULT 0,
  
  -- Recruitment
  open_positions INTEGER DEFAULT 0,
  new_applications INTEGER DEFAULT 0,
  interviews_scheduled INTEGER DEFAULT 0,
  
  -- Full report content (HTML for email, JSON for dashboard)
  report_summary TEXT,
  report_data JSONB DEFAULT '{}'::jsonb,
  
  -- Email delivery tracking
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMPTZ,
  email_recipients TEXT[],
  
  -- Metadata
  generated_by TEXT DEFAULT 'system',
  status TEXT DEFAULT 'generated' CHECK (status IN ('generated', 'sent', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.weekly_management_reports ENABLE ROW LEVEL SECURITY;

-- Only admin/superadmin can view reports for their tenant
CREATE POLICY "Admins can view their tenant reports"
  ON public.weekly_management_reports
  FOR SELECT
  USING (
    tenant_id = get_user_tenant_id()
    AND (
      has_role(auth.uid(), 'admin') 
      OR has_role(auth.uid(), 'superadmin')
      OR has_role(auth.uid(), 'head')
    )
  );

-- System can insert reports (via service role)
CREATE POLICY "Service role can manage reports"
  ON public.weekly_management_reports
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Index for fast lookups
CREATE INDEX idx_weekly_mgmt_reports_tenant_period 
  ON public.weekly_management_reports(tenant_id, report_period_start DESC);

-- Updated at trigger
CREATE TRIGGER update_weekly_management_reports_updated_at
  BEFORE UPDATE ON public.weekly_management_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
