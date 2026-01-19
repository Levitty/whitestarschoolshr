-- Create an RLS policy that allows admins and superadmins to insert employee profiles in their tenant
-- First, let's drop the existing restrictive policy and replace with separate SELECT and INSERT policies for clarity

-- Drop the existing combined policy
DROP POLICY IF EXISTS "Admins and superadmins can manage employee profiles in their te" ON public.employee_profiles;

-- Create separate INSERT policy
CREATE POLICY "Admins can insert employee profiles in their tenant"
ON public.employee_profiles
FOR INSERT
WITH CHECK (
  (tenant_id = get_user_tenant_id() AND get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text]))
  OR EXISTS (SELECT 1 FROM saas_admins WHERE saas_admins.user_id = auth.uid())
);

-- Create UPDATE policy
CREATE POLICY "Admins can update employee profiles in their tenant"
ON public.employee_profiles
FOR UPDATE
USING (
  (tenant_id = get_user_tenant_id() AND get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text]))
  OR EXISTS (SELECT 1 FROM saas_admins WHERE saas_admins.user_id = auth.uid())
);

-- Create DELETE policy
CREATE POLICY "Admins can delete employee profiles in their tenant"
ON public.employee_profiles
FOR DELETE
USING (
  (tenant_id = get_user_tenant_id() AND get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text]))
  OR EXISTS (SELECT 1 FROM saas_admins WHERE saas_admins.user_id = auth.uid())
);