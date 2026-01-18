-- Create corporate evaluations table for non-school tenants
CREATE TABLE public.corporate_evaluations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employee_profiles(id) ON DELETE CASCADE,
  evaluator_id UUID NOT NULL REFERENCES public.profiles(id),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  period TEXT NOT NULL, -- e.g., "Q1 2026", "Annual 2025"
  evaluation_type TEXT NOT NULL CHECK (evaluation_type IN ('quarterly', 'annual', 'probation')),
  
  -- Corporate Rating Criteria (1-5 scale)
  technical_skills NUMERIC(2,1) CHECK (technical_skills >= 1 AND technical_skills <= 5),
  quality_of_work NUMERIC(2,1) CHECK (quality_of_work >= 1 AND quality_of_work <= 5),
  productivity NUMERIC(2,1) CHECK (productivity >= 1 AND productivity <= 5),
  communication NUMERIC(2,1) CHECK (communication >= 1 AND communication <= 5),
  teamwork NUMERIC(2,1) CHECK (teamwork >= 1 AND teamwork <= 5),
  
  -- Comments for each criterion
  technical_skills_comments TEXT,
  quality_of_work_comments TEXT,
  productivity_comments TEXT,
  communication_comments TEXT,
  teamwork_comments TEXT,
  
  -- Summary fields
  overall_rating NUMERIC(2,1),
  strengths TEXT,
  improvement_areas TEXT,
  goals TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved')),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.corporate_evaluations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view evaluations in their tenant"
  ON public.corporate_evaluations
  FOR SELECT
  USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Admins can insert evaluations"
  ON public.corporate_evaluations
  FOR INSERT
  WITH CHECK (
    tenant_id = public.get_user_tenant_id() AND
    (public.get_current_user_role() IN ('superadmin', 'admin', 'head'))
  );

CREATE POLICY "Admins can update evaluations"
  ON public.corporate_evaluations
  FOR UPDATE
  USING (
    tenant_id = public.get_user_tenant_id() AND
    (public.get_current_user_role() IN ('superadmin', 'admin', 'head') OR evaluator_id = auth.uid())
  );

CREATE POLICY "Admins can delete evaluations"
  ON public.corporate_evaluations
  FOR DELETE
  USING (
    tenant_id = public.get_user_tenant_id() AND
    public.get_current_user_role() IN ('superadmin', 'admin')
  );

-- Create function to calculate overall rating
CREATE OR REPLACE FUNCTION public.calculate_corporate_evaluation_overall()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Calculate overall rating as average of all 5 criteria
  NEW.overall_rating := (
    COALESCE(NEW.technical_skills, 0) +
    COALESCE(NEW.quality_of_work, 0) +
    COALESCE(NEW.productivity, 0) +
    COALESCE(NEW.communication, 0) +
    COALESCE(NEW.teamwork, 0)
  ) / 5.0;
  
  NEW.updated_at := now();
  RETURN NEW;
END;
$function$;

-- Create trigger for auto-calculating overall rating
CREATE TRIGGER calculate_corporate_evaluation_overall_trigger
  BEFORE INSERT OR UPDATE ON public.corporate_evaluations
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_corporate_evaluation_overall();

-- Create index for better performance
CREATE INDEX idx_corporate_evaluations_employee ON public.corporate_evaluations(employee_id);
CREATE INDEX idx_corporate_evaluations_tenant ON public.corporate_evaluations(tenant_id);
CREATE INDEX idx_corporate_evaluations_period ON public.corporate_evaluations(period);