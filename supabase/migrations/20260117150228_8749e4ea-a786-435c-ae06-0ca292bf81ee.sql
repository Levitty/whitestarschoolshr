-- CRITICAL: Drop ALL existing policies on tenant_users and start fresh
-- The issue is existing policies with self-referencing queries

-- Drop all policies
DROP POLICY IF EXISTS "Tenant admins can manage users in their tenant" ON tenant_users;
DROP POLICY IF EXISTS "Users can view their own tenant memberships" ON tenant_users;
DROP POLICY IF EXISTS "Tenant admins can add users to their tenant" ON tenant_users;
DROP POLICY IF EXISTS "Tenant admins can update users in their tenant" ON tenant_users;
DROP POLICY IF EXISTS "Tenant admins can remove users from their tenant" ON tenant_users;
DROP POLICY IF EXISTS "SaaS admins can manage all tenant_users" ON tenant_users;
DROP POLICY IF EXISTS "Tenant admins can delete users" ON tenant_users;
DROP POLICY IF EXISTS "Tenant admins can insert users" ON tenant_users;
DROP POLICY IF EXISTS "Tenant admins can update users" ON tenant_users;
DROP POLICY IF EXISTS "Users can view own tenant membership" ON tenant_users;

-- Create/update the security definer function to check tenant admin status
CREATE OR REPLACE FUNCTION public.check_tenant_admin_status(check_user_id uuid, check_tenant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM tenant_users 
    WHERE user_id = check_user_id 
    AND tenant_id = check_tenant_id 
    AND is_tenant_admin = true
  );
$$;

-- Simple, non-recursive SELECT policy: users can see their own memberships or if saas admin
CREATE POLICY "Users can view own tenant memberships"
  ON tenant_users FOR SELECT
  USING (
    user_id = auth.uid()
    OR is_saas_admin()
  );

-- Tenant admins and SaaS admins can view all in their tenant
CREATE POLICY "Admins can view all tenant users"
  ON tenant_users FOR SELECT
  USING (
    check_tenant_admin_status(auth.uid(), tenant_id)
  );

-- INSERT policy using the security definer function
CREATE POLICY "Admins can add tenant users"
  ON tenant_users FOR INSERT
  WITH CHECK (
    check_tenant_admin_status(auth.uid(), tenant_id)
    OR is_saas_admin()
  );

-- UPDATE policy using the security definer function
CREATE POLICY "Admins can update tenant users"
  ON tenant_users FOR UPDATE
  USING (
    check_tenant_admin_status(auth.uid(), tenant_id)
    OR is_saas_admin()
  );

-- DELETE policy using the security definer function
CREATE POLICY "Admins can delete tenant users"
  ON tenant_users FOR DELETE
  USING (
    check_tenant_admin_status(auth.uid(), tenant_id)
    OR is_saas_admin()
  );