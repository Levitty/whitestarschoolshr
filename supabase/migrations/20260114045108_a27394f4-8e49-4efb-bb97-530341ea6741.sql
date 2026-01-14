-- First, fix infinite recursion in tenant_users by dropping and recreating policies with security definer function
DROP POLICY IF EXISTS "Users can view their tenant membership" ON public.tenant_users;
DROP POLICY IF EXISTS "Tenant admins can manage users" ON public.tenant_users;
DROP POLICY IF EXISTS "Users can view own tenant membership" ON public.tenant_users;
DROP POLICY IF EXISTS "Admins can manage tenant users" ON public.tenant_users;

-- Create a security definer function to check tenant admin status without recursion
CREATE OR REPLACE FUNCTION public.is_tenant_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM tenant_users 
    WHERE user_id = _user_id AND is_tenant_admin = true
  )
$$;

-- Create non-recursive policies for tenant_users
CREATE POLICY "Users can view own tenant membership"
ON public.tenant_users FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Tenant admins can insert users"
ON public.tenant_users FOR INSERT
WITH CHECK (
  public.is_tenant_admin(auth.uid()) OR 
  public.is_saas_admin() OR 
  public.has_role(auth.uid(), 'superadmin')
);

CREATE POLICY "Tenant admins can update users"
ON public.tenant_users FOR UPDATE
USING (
  public.is_tenant_admin(auth.uid()) OR 
  public.is_saas_admin() OR 
  public.has_role(auth.uid(), 'superadmin')
);

CREATE POLICY "Tenant admins can delete users"
ON public.tenant_users FOR DELETE
USING (
  public.is_tenant_admin(auth.uid()) OR 
  public.is_saas_admin() OR 
  public.has_role(auth.uid(), 'superadmin')
);

-- Fix departments RLS policies
DROP POLICY IF EXISTS "Departments are viewable by tenant members" ON public.departments;
DROP POLICY IF EXISTS "Admins can manage departments" ON public.departments;
DROP POLICY IF EXISTS "Users can view departments in their tenant" ON public.departments;
DROP POLICY IF EXISTS "Admins can insert departments" ON public.departments;
DROP POLICY IF EXISTS "Admins can update departments" ON public.departments;
DROP POLICY IF EXISTS "Admins can delete departments" ON public.departments;

-- Create proper departments policies using get_user_tenant_id function
CREATE POLICY "Users can view departments in their tenant"
ON public.departments FOR SELECT
USING (tenant_id = public.get_user_tenant_id() OR public.is_saas_admin());

CREATE POLICY "Admins can insert departments"
ON public.departments FOR INSERT
WITH CHECK (
  (tenant_id = public.get_user_tenant_id() AND (
    public.has_role(auth.uid(), 'superadmin') OR 
    public.has_role(auth.uid(), 'admin')
  )) OR public.is_saas_admin()
);

CREATE POLICY "Admins can update departments"
ON public.departments FOR UPDATE
USING (
  (tenant_id = public.get_user_tenant_id() AND (
    public.has_role(auth.uid(), 'superadmin') OR 
    public.has_role(auth.uid(), 'admin')
  )) OR public.is_saas_admin()
);

CREATE POLICY "Admins can delete departments"
ON public.departments FOR DELETE
USING (
  (tenant_id = public.get_user_tenant_id() AND (
    public.has_role(auth.uid(), 'superadmin') OR 
    public.has_role(auth.uid(), 'admin')
  )) OR public.is_saas_admin()
);