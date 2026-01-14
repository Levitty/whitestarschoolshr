-- Fix profiles RLS to include tenant_id filtering
DROP POLICY IF EXISTS "Admins and superadmins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins and superadmins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins and superadmins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Users can only view profiles in their tenant
CREATE POLICY "Users can view profiles in their tenant"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  id = auth.uid()
  OR (
    tenant_id = get_user_tenant_id()
    AND get_current_user_role() IN ('admin', 'superadmin', 'head')
  )
  OR EXISTS (SELECT 1 FROM saas_admins WHERE user_id = auth.uid())
);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Admins can update profiles in their tenant
CREATE POLICY "Admins can update profiles in their tenant"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  (tenant_id = get_user_tenant_id() AND get_current_user_role() IN ('admin', 'superadmin'))
  OR EXISTS (SELECT 1 FROM saas_admins WHERE user_id = auth.uid())
)
WITH CHECK (
  (tenant_id = get_user_tenant_id() AND get_current_user_role() IN ('admin', 'superadmin'))
  OR EXISTS (SELECT 1 FROM saas_admins WHERE user_id = auth.uid())
);

-- Allow profile creation (for new user signup)
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (id = auth.uid());

-- Create a function to create default departments for a new tenant
CREATE OR REPLACE FUNCTION public.create_default_departments_for_tenant(p_tenant_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert default departments if they don't exist for this tenant
  INSERT INTO departments (name, description, tenant_id)
  VALUES 
    ('Administration', 'School administration and management', p_tenant_id),
    ('Teaching Staff', 'Academic teaching department', p_tenant_id),
    ('Support Staff', 'Non-teaching support personnel', p_tenant_id),
    ('Finance', 'Financial and accounting department', p_tenant_id),
    ('Human Resources', 'HR and personnel management', p_tenant_id)
  ON CONFLICT DO NOTHING;
END;
$$;

-- Create trigger to auto-create departments when a new tenant is created
CREATE OR REPLACE FUNCTION public.on_tenant_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create default departments for the new tenant
  PERFORM create_default_departments_for_tenant(NEW.id);
  RETURN NEW;
END;
$$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_create_tenant_departments ON public.tenants;
CREATE TRIGGER trigger_create_tenant_departments
  AFTER INSERT ON public.tenants
  FOR EACH ROW
  EXECUTE FUNCTION public.on_tenant_created();