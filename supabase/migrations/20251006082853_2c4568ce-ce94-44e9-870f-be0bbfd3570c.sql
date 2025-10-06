-- Fix RLS policies for leave_balances, weekly_reports, and employee_profiles
-- Only superadmins should have access to these sensitive tables

-- ============================================
-- LEAVE BALANCES - Restrict to superadmins only
-- ============================================

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can manage leave balances" ON public.leave_balances;
DROP POLICY IF EXISTS "Employees can view all leave balances" ON public.leave_balances;

-- Create superadmin-only policies
CREATE POLICY "Superadmins can manage leave balances"
ON public.leave_balances
FOR ALL
USING (public.has_role(auth.uid(), 'superadmin'))
WITH CHECK (public.has_role(auth.uid(), 'superadmin'));

-- ============================================
-- WEEKLY REPORTS - Restrict to superadmins only
-- ============================================

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Employees can create their own reports" ON public.weekly_reports;
DROP POLICY IF EXISTS "Employees can update their own reports" ON public.weekly_reports;
DROP POLICY IF EXISTS "Employees can view all reports" ON public.weekly_reports;

-- Create superadmin-only policies
CREATE POLICY "Superadmins can manage weekly reports"
ON public.weekly_reports
FOR ALL
USING (public.has_role(auth.uid(), 'superadmin'))
WITH CHECK (public.has_role(auth.uid(), 'superadmin'));

-- ============================================
-- EMPLOYEE PROFILES - Restrict to superadmins only
-- ============================================

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can create employee profiles" ON public.employee_profiles;
DROP POLICY IF EXISTS "Anyone can update employee profiles" ON public.employee_profiles;
DROP POLICY IF EXISTS "Anyone can view employee profiles" ON public.employee_profiles;

-- Create superadmin-only policies
CREATE POLICY "Superadmins can manage employee profiles"
ON public.employee_profiles
FOR ALL
USING (public.has_role(auth.uid(), 'superadmin'))
WITH CHECK (public.has_role(auth.uid(), 'superadmin'));

-- Add comments for documentation
COMMENT ON TABLE public.leave_balances IS 'Employee leave balances. Access restricted to superadmins only for data privacy.';
COMMENT ON TABLE public.weekly_reports IS 'Employee weekly reports. Access restricted to superadmins only for confidentiality.';
COMMENT ON TABLE public.employee_profiles IS 'Employee personal information. Access restricted to superadmins only to protect PII.';