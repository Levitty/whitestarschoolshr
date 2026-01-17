-- Fix infinite recursion - drop existing policies first then recreate

-- Drop all existing policies on tenant_users to start fresh
DROP POLICY IF EXISTS "Users can view their own tenant memberships" ON tenant_users;
DROP POLICY IF EXISTS "Tenant admins can add users to their tenant" ON tenant_users;
DROP POLICY IF EXISTS "Tenant admins can update users in their tenant" ON tenant_users;
DROP POLICY IF EXISTS "Tenant admins can remove users from their tenant" ON tenant_users;

-- Recreate the security definer function
CREATE OR REPLACE FUNCTION public.check_tenant_admin_for_tenant(check_user_id uuid, check_tenant_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM tenant_users 
    WHERE user_id = check_user_id 
    AND tenant_id = check_tenant_id 
    AND is_tenant_admin = true
  );
END;
$$;

-- Recreate policies
CREATE POLICY "Users can view their own tenant memberships"
  ON tenant_users FOR SELECT
  USING (
    user_id = auth.uid()
    OR check_tenant_admin_for_tenant(auth.uid(), tenant_id)
    OR is_saas_admin()
  );

CREATE POLICY "Tenant admins can add users to their tenant"
  ON tenant_users FOR INSERT
  WITH CHECK (
    check_tenant_admin_for_tenant(auth.uid(), tenant_id)
    OR is_saas_admin()
  );

CREATE POLICY "Tenant admins can update users in their tenant"
  ON tenant_users FOR UPDATE
  USING (
    check_tenant_admin_for_tenant(auth.uid(), tenant_id)
    OR is_saas_admin()
  );

CREATE POLICY "Tenant admins can remove users from their tenant"
  ON tenant_users FOR DELETE
  USING (
    check_tenant_admin_for_tenant(auth.uid(), tenant_id)
    OR is_saas_admin()
  );