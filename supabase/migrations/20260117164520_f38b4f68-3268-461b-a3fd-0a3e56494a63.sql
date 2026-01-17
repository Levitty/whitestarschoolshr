-- =====================================================
-- ENTERPRISE HR FEATURES FOR ENDA SPORTSWEAR
-- =====================================================

-- 1. Employee Sales Targets Table
CREATE TABLE public.employee_sales_targets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employee_profiles(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.tenants(id),
  monthly_target NUMERIC NOT NULL DEFAULT 1500000,
  commission_rate NUMERIC NOT NULL DEFAULT 0.05,
  current_mtd_sales NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id)
);

-- 2. Performance Improvement Plans Table
CREATE TABLE public.performance_improvement_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employee_profiles(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.tenants(id),
  area_of_deficiency TEXT NOT NULL CHECK (area_of_deficiency IN ('sales_target', 'attendance', 'conduct')),
  expected_outcome TEXT NOT NULL,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  check_in_date DATE NOT NULL,
  review_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'terminated')),
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Offboarding Clearance Table
CREATE TABLE public.offboarding_clearance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employee_profiles(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.tenants(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  initiated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id)
);

-- 4. Clearance Items Table
CREATE TABLE public.clearance_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clearance_id UUID NOT NULL REFERENCES public.offboarding_clearance(id) ON DELETE CASCADE,
  department TEXT NOT NULL CHECK (department IN ('IT', 'Finance', 'Operations')),
  item_name TEXT NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.employee_sales_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_improvement_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offboarding_clearance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clearance_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for employee_sales_targets
CREATE POLICY "Users can view sales targets in their tenant"
ON public.employee_sales_targets FOR SELECT
USING (
  (tenant_id = get_user_tenant_id()) 
  OR (EXISTS (SELECT 1 FROM saas_admins WHERE saas_admins.user_id = auth.uid()))
);

CREATE POLICY "Admins can manage sales targets in their tenant"
ON public.employee_sales_targets FOR ALL
USING (
  ((tenant_id = get_user_tenant_id()) AND (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text, 'head'::text])))
  OR (EXISTS (SELECT 1 FROM saas_admins WHERE saas_admins.user_id = auth.uid()))
);

-- RLS Policies for performance_improvement_plans
CREATE POLICY "Users can view PIPs in their tenant"
ON public.performance_improvement_plans FOR SELECT
USING (
  (tenant_id = get_user_tenant_id()) 
  OR (EXISTS (SELECT 1 FROM saas_admins WHERE saas_admins.user_id = auth.uid()))
);

CREATE POLICY "Admins can manage PIPs in their tenant"
ON public.performance_improvement_plans FOR ALL
USING (
  ((tenant_id = get_user_tenant_id()) AND (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text, 'head'::text])))
  OR (EXISTS (SELECT 1 FROM saas_admins WHERE saas_admins.user_id = auth.uid()))
);

-- RLS Policies for offboarding_clearance
CREATE POLICY "Users can view clearance in their tenant"
ON public.offboarding_clearance FOR SELECT
USING (
  (tenant_id = get_user_tenant_id()) 
  OR (EXISTS (SELECT 1 FROM saas_admins WHERE saas_admins.user_id = auth.uid()))
);

CREATE POLICY "Admins can manage clearance in their tenant"
ON public.offboarding_clearance FOR ALL
USING (
  ((tenant_id = get_user_tenant_id()) AND (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text, 'head'::text])))
  OR (EXISTS (SELECT 1 FROM saas_admins WHERE saas_admins.user_id = auth.uid()))
);

-- RLS Policies for clearance_items
CREATE POLICY "Users can view clearance items"
ON public.clearance_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM offboarding_clearance oc 
    WHERE oc.id = clearance_items.clearance_id 
    AND (oc.tenant_id = get_user_tenant_id() OR EXISTS (SELECT 1 FROM saas_admins WHERE saas_admins.user_id = auth.uid()))
  )
);

CREATE POLICY "Admins can manage clearance items"
ON public.clearance_items FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM offboarding_clearance oc 
    WHERE oc.id = clearance_items.clearance_id 
    AND ((oc.tenant_id = get_user_tenant_id() AND get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text, 'head'::text]))
    OR EXISTS (SELECT 1 FROM saas_admins WHERE saas_admins.user_id = auth.uid()))
  )
);

-- Create update triggers for updated_at
CREATE TRIGGER update_employee_sales_targets_updated_at
BEFORE UPDATE ON public.employee_sales_targets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_performance_improvement_plans_updated_at
BEFORE UPDATE ON public.performance_improvement_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_offboarding_clearance_updated_at
BEFORE UPDATE ON public.offboarding_clearance
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();