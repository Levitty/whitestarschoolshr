-- ============================================
-- PAYROLL MANAGEMENT - DATABASE MIGRATION
-- Run this in Supabase SQL Editor
-- Already executed on 2026-03-12
-- ============================================

CREATE TABLE IF NOT EXISTS public.payroll_runs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  month integer NOT NULL CHECK (month >= 1 AND month <= 12),
  year integer NOT NULL CHECK (year >= 2020),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'approved', 'paid')),
  total_gross numeric(12,2) NOT NULL DEFAULT 0,
  total_net numeric(12,2) NOT NULL DEFAULT 0,
  total_paye numeric(12,2) NOT NULL DEFAULT 0,
  total_shif numeric(12,2) NOT NULL DEFAULT 0,
  total_nssf numeric(12,2) NOT NULL DEFAULT 0,
  total_housing_levy numeric(12,2) NOT NULL DEFAULT 0,
  total_employer_cost numeric(12,2) NOT NULL DEFAULT 0,
  employee_count integer NOT NULL DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  approved_by uuid REFERENCES auth.users(id),
  paid_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, month, year)
);

CREATE TABLE IF NOT EXISTS public.payroll_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  payroll_run_id uuid NOT NULL REFERENCES public.payroll_runs(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL,
  employee_name text NOT NULL,
  employee_number text,
  department text,
  basic_salary numeric(12,2) NOT NULL DEFAULT 0,
  house_allowance numeric(12,2) NOT NULL DEFAULT 0,
  transport_allowance numeric(12,2) NOT NULL DEFAULT 0,
  overtime_allowance numeric(12,2) NOT NULL DEFAULT 0,
  other_allowances numeric(12,2) NOT NULL DEFAULT 0,
  gross_salary numeric(12,2) NOT NULL DEFAULT 0,
  taxable_income numeric(12,2) NOT NULL DEFAULT 0,
  paye numeric(12,2) NOT NULL DEFAULT 0,
  personal_relief numeric(12,2) NOT NULL DEFAULT 0,
  insurance_relief numeric(12,2) NOT NULL DEFAULT 0,
  net_paye numeric(12,2) NOT NULL DEFAULT 0,
  shif numeric(12,2) NOT NULL DEFAULT 0,
  nssf_tier_i numeric(12,2) NOT NULL DEFAULT 0,
  nssf_tier_ii numeric(12,2) NOT NULL DEFAULT 0,
  nssf_total numeric(12,2) NOT NULL DEFAULT 0,
  housing_levy numeric(12,2) NOT NULL DEFAULT 0,
  loan_repayment numeric(12,2) NOT NULL DEFAULT 0,
  sacco_contribution numeric(12,2) NOT NULL DEFAULT 0,
  union_dues numeric(12,2) NOT NULL DEFAULT 0,
  other_deductions numeric(12,2) NOT NULL DEFAULT 0,
  total_deductions numeric(12,2) NOT NULL DEFAULT 0,
  net_salary numeric(12,2) NOT NULL DEFAULT 0,
  employer_nssf numeric(12,2) NOT NULL DEFAULT 0,
  employer_housing_levy numeric(12,2) NOT NULL DEFAULT 0,
  total_employer_cost numeric(12,2) NOT NULL DEFAULT 0,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_items ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "payroll_runs_select" ON public.payroll_runs FOR SELECT USING (
  tenant_id IN (SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid())
  OR tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
);
CREATE POLICY "payroll_runs_insert" ON public.payroll_runs FOR INSERT WITH CHECK (
  tenant_id IN (SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid())
  OR tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
);
CREATE POLICY "payroll_runs_update" ON public.payroll_runs FOR UPDATE USING (
  tenant_id IN (SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid())
  OR tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
);
CREATE POLICY "payroll_runs_delete" ON public.payroll_runs FOR DELETE USING (
  status = 'draft' AND (
    tenant_id IN (SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid())
    OR tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
  )
);

CREATE POLICY "payroll_items_select" ON public.payroll_items FOR SELECT USING (
  tenant_id IN (SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid())
  OR tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
);
CREATE POLICY "payroll_items_insert" ON public.payroll_items FOR INSERT WITH CHECK (
  tenant_id IN (SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid())
  OR tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
);
CREATE POLICY "payroll_items_delete" ON public.payroll_items FOR DELETE USING (
  tenant_id IN (SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid())
  OR tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payroll_runs_tenant ON public.payroll_runs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payroll_runs_period ON public.payroll_runs(tenant_id, year, month);
CREATE INDEX IF NOT EXISTS idx_payroll_items_run ON public.payroll_items(payroll_run_id);
CREATE INDEX IF NOT EXISTS idx_payroll_items_employee ON public.payroll_items(employee_id);
