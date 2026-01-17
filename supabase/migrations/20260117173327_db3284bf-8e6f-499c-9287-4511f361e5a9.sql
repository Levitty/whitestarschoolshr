-- SALES PERFORMANCE MANAGEMENT SYSTEM

-- Create sales_performance table
CREATE TABLE public.sales_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employee_profiles(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL,
  target_amount NUMERIC NOT NULL,
  actual_sales NUMERIC DEFAULT 0,
  commission_rate NUMERIC DEFAULT 0.05,
  status TEXT CHECK (status IN ('on_track', 'warning', 'critical')) DEFAULT 'on_track',
  notes TEXT,
  supporting_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (employee_id, month, year)
);

-- Add supporting_data column to performance_improvement_plans if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'performance_improvement_plans' 
    AND column_name = 'supporting_data'
  ) THEN
    ALTER TABLE public.performance_improvement_plans ADD COLUMN supporting_data JSONB;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE public.sales_performance ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view sales performance in their tenant
CREATE POLICY "Users can view sales performance in their tenant"
ON public.sales_performance
FOR SELECT
USING (
  (tenant_id = get_user_tenant_id())
  OR EXISTS (SELECT 1 FROM saas_admins WHERE saas_admins.user_id = auth.uid())
);

-- RLS Policy: Employees can view their own sales records
CREATE POLICY "Employees can view own sales performance"
ON public.sales_performance
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM employee_profiles ep 
    WHERE ep.id = sales_performance.employee_id 
    AND ep.profile_id = auth.uid()
  )
);

-- RLS Policy: Admins can manage sales performance in their tenant
CREATE POLICY "Admins can manage sales performance in their tenant"
ON public.sales_performance
FOR ALL
USING (
  ((tenant_id = get_user_tenant_id()) AND (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text, 'head'::text])))
  OR EXISTS (SELECT 1 FROM saas_admins WHERE saas_admins.user_id = auth.uid())
)
WITH CHECK (
  ((tenant_id = get_user_tenant_id()) AND (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text, 'head'::text])))
  OR EXISTS (SELECT 1 FROM saas_admins WHERE saas_admins.user_id = auth.uid())
);

-- Create updated_at trigger
CREATE TRIGGER update_sales_performance_updated_at
BEFORE UPDATE ON public.sales_performance
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();