-- Drop existing department policies and recreate with proper tenant isolation
DROP POLICY IF EXISTS "Departments are viewable by tenant members" ON public.departments;
DROP POLICY IF EXISTS "Admins can insert departments" ON public.departments;
DROP POLICY IF EXISTS "Admins can update departments" ON public.departments;
DROP POLICY IF EXISTS "Admins can delete departments" ON public.departments;
DROP POLICY IF EXISTS "Anyone can view departments" ON public.departments;
DROP POLICY IF EXISTS "Authenticated users can view departments" ON public.departments;
DROP POLICY IF EXISTS "Users can view departments in their tenant" ON public.departments;
DROP POLICY IF EXISTS "Admins can manage departments" ON public.departments;

-- Enable RLS if not already
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can only see departments in their tenant (or SaaS admins see all)
CREATE POLICY "Users can view departments in their tenant"
ON public.departments FOR SELECT
USING (
  tenant_id = public.get_user_tenant_id()
  OR public.is_saas_admin()
);

-- INSERT: Admins can create departments for their tenant
CREATE POLICY "Admins can insert departments in their tenant"
ON public.departments FOR INSERT
WITH CHECK (
  (tenant_id = public.get_user_tenant_id() OR public.is_saas_admin())
  AND public.get_current_user_role() IN ('superadmin', 'admin', 'head')
);

-- UPDATE: Admins can update departments in their tenant
CREATE POLICY "Admins can update departments in their tenant"
ON public.departments FOR UPDATE
USING (
  (tenant_id = public.get_user_tenant_id() OR public.is_saas_admin())
  AND public.get_current_user_role() IN ('superadmin', 'admin', 'head')
);

-- DELETE: Admins can delete departments in their tenant
CREATE POLICY "Admins can delete departments in their tenant"
ON public.departments FOR DELETE
USING (
  (tenant_id = public.get_user_tenant_id() OR public.is_saas_admin())
  AND public.get_current_user_role() IN ('superadmin', 'admin', 'head')
);