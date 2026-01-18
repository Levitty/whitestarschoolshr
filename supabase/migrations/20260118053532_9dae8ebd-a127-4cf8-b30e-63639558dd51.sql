-- Create company_assets table
CREATE TABLE public.company_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('laptop', 'phone', 'tablet', 'uniform', 'vehicle', 'tool', 'access_card', 'keys', 'other')),
  asset_name TEXT NOT NULL,
  asset_tag TEXT NOT NULL,
  serial_number TEXT,
  purchase_value NUMERIC NOT NULL,
  current_value NUMERIC NOT NULL,
  purchase_date DATE,
  status TEXT CHECK (status IN ('available', 'assigned', 'maintenance', 'retired', 'lost')) DEFAULT 'available',
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_date DATE,
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (tenant_id, asset_tag)
);

-- Create asset_assignments table for tracking history
CREATE TABLE public.asset_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES public.company_assets(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  assigned_date DATE NOT NULL,
  returned_date DATE,
  condition_on_assign TEXT CHECK (condition_on_assign IN ('new', 'excellent', 'good', 'fair', 'poor')) DEFAULT 'good',
  condition_on_return TEXT CHECK (condition_on_return IN ('excellent', 'good', 'fair', 'poor', 'damaged', 'lost')),
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create clearance_deductions table
CREATE TABLE public.clearance_deductions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clearance_id UUID NOT NULL REFERENCES public.offboarding_clearance(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  deduction_type TEXT NOT NULL CHECK (deduction_type IN ('asset_not_returned', 'asset_damaged', 'advance_not_cleared', 'leave_overdrawn', 'other')),
  asset_id UUID REFERENCES public.company_assets(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add settlement columns to offboarding_clearance
ALTER TABLE public.offboarding_clearance
ADD COLUMN IF NOT EXISTS outstanding_salary NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS leave_balance_payout NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_deductions NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS final_settlement_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS settlement_status TEXT CHECK (settlement_status IN ('pending_calculation', 'calculated', 'approved', 'paid')) DEFAULT 'pending_calculation',
ADD COLUMN IF NOT EXISTS settlement_approved_by UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS settlement_approved_at TIMESTAMPTZ;

-- Enable RLS
ALTER TABLE public.company_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clearance_deductions ENABLE ROW LEVEL SECURITY;

-- RLS policies for company_assets
CREATE POLICY "Users can view assets in their tenant"
  ON public.company_assets FOR SELECT
  USING (
    (tenant_id = get_user_tenant_id()) OR
    (EXISTS (SELECT 1 FROM saas_admins WHERE saas_admins.user_id = auth.uid()))
  );

CREATE POLICY "Admins can manage assets in their tenant"
  ON public.company_assets FOR ALL
  USING (
    ((tenant_id = get_user_tenant_id()) AND (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text, 'head'::text]))) OR
    (EXISTS (SELECT 1 FROM saas_admins WHERE saas_admins.user_id = auth.uid()))
  )
  WITH CHECK (
    ((tenant_id = get_user_tenant_id()) AND (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text, 'head'::text]))) OR
    (EXISTS (SELECT 1 FROM saas_admins WHERE saas_admins.user_id = auth.uid()))
  );

CREATE POLICY "Employees can view their assigned assets"
  ON public.company_assets FOR SELECT
  USING (assigned_to = auth.uid());

-- RLS policies for asset_assignments
CREATE POLICY "Users can view assignments in their tenant"
  ON public.asset_assignments FOR SELECT
  USING (
    (tenant_id = get_user_tenant_id()) OR
    (EXISTS (SELECT 1 FROM saas_admins WHERE saas_admins.user_id = auth.uid()))
  );

CREATE POLICY "Admins can manage assignments in their tenant"
  ON public.asset_assignments FOR ALL
  USING (
    ((tenant_id = get_user_tenant_id()) AND (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text, 'head'::text]))) OR
    (EXISTS (SELECT 1 FROM saas_admins WHERE saas_admins.user_id = auth.uid()))
  )
  WITH CHECK (
    ((tenant_id = get_user_tenant_id()) AND (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text, 'head'::text]))) OR
    (EXISTS (SELECT 1 FROM saas_admins WHERE saas_admins.user_id = auth.uid()))
  );

CREATE POLICY "Employees can view their own assignments"
  ON public.asset_assignments FOR SELECT
  USING (employee_id = auth.uid());

-- RLS policies for clearance_deductions
CREATE POLICY "Users can view deductions in their tenant"
  ON public.clearance_deductions FOR SELECT
  USING (
    (tenant_id = get_user_tenant_id()) OR
    (EXISTS (SELECT 1 FROM saas_admins WHERE saas_admins.user_id = auth.uid()))
  );

CREATE POLICY "Admins can manage deductions in their tenant"
  ON public.clearance_deductions FOR ALL
  USING (
    ((tenant_id = get_user_tenant_id()) AND (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text, 'head'::text]))) OR
    (EXISTS (SELECT 1 FROM saas_admins WHERE saas_admins.user_id = auth.uid()))
  )
  WITH CHECK (
    ((tenant_id = get_user_tenant_id()) AND (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text, 'head'::text]))) OR
    (EXISTS (SELECT 1 FROM saas_admins WHERE saas_admins.user_id = auth.uid()))
  );

-- Create updated_at triggers
CREATE TRIGGER update_company_assets_updated_at
  BEFORE UPDATE ON public.company_assets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_company_assets_tenant_id ON public.company_assets(tenant_id);
CREATE INDEX idx_company_assets_assigned_to ON public.company_assets(assigned_to);
CREATE INDEX idx_company_assets_status ON public.company_assets(status);
CREATE INDEX idx_asset_assignments_asset_id ON public.asset_assignments(asset_id);
CREATE INDEX idx_asset_assignments_employee_id ON public.asset_assignments(employee_id);
CREATE INDEX idx_clearance_deductions_clearance_id ON public.clearance_deductions(clearance_id);