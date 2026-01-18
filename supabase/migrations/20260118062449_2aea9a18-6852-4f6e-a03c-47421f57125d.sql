-- Create clearance_approvals table
CREATE TABLE public.clearance_approvals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clearance_id uuid NOT NULL REFERENCES public.offboarding_clearance(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  department text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by uuid REFERENCES public.profiles(id),
  approved_at timestamptz,
  rejection_reason text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(clearance_id, department)
);

-- Enable RLS
ALTER TABLE public.clearance_approvals ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger
CREATE TRIGGER update_clearance_approvals_updated_at
  BEFORE UPDATE ON public.clearance_approvals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies
CREATE POLICY "Users can view approvals in their tenant"
  ON public.clearance_approvals FOR SELECT
  USING (
    tenant_id = get_user_tenant_id()
    OR EXISTS (SELECT 1 FROM saas_admins WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all approvals in their tenant"
  ON public.clearance_approvals FOR ALL
  USING (
    (tenant_id = get_user_tenant_id() AND get_current_user_role() IN ('admin', 'superadmin'))
    OR EXISTS (SELECT 1 FROM saas_admins WHERE user_id = auth.uid())
  );

CREATE POLICY "Department heads can update their department approvals"
  ON public.clearance_approvals FOR UPDATE
  USING (
    tenant_id = get_user_tenant_id()
    AND EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.department = clearance_approvals.department
      AND p.role IN ('head', 'admin', 'superadmin')
    )
  );

-- Function to initialize clearance approvals
CREATE OR REPLACE FUNCTION public.initialize_clearance_approvals()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.clearance_approvals (clearance_id, tenant_id, department)
  VALUES 
    (NEW.id, NEW.tenant_id, 'IT'),
    (NEW.id, NEW.tenant_id, 'Finance'),
    (NEW.id, NEW.tenant_id, 'Operations'),
    (NEW.id, NEW.tenant_id, 'HR');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to auto-create approvals when clearance is created
CREATE TRIGGER on_clearance_created_initialize_approvals
  AFTER INSERT ON public.offboarding_clearance
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_clearance_approvals();

-- Function to check if clearance is fully approved
CREATE OR REPLACE FUNCTION public.check_clearance_fully_approved(p_clearance_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM public.clearance_approvals
    WHERE clearance_id = p_clearance_id
    AND status != 'approved'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;