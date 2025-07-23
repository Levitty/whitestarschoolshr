
-- Fix the RLS policies to prevent infinite recursion
-- Drop existing policies that might cause recursion
DROP POLICY IF EXISTS "Superadmins can manage roles" ON public.roles;
DROP POLICY IF EXISTS "Superadmins can manage permissions" ON public.permissions;
DROP POLICY IF EXISTS "Superadmins can manage role permissions" ON public.role_permissions;

-- Create new policies that don't cause recursion by using the role column directly
CREATE POLICY "Superadmins can manage roles" ON public.roles
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND p.role = 'superadmin'
  )
);

CREATE POLICY "Superadmins can manage permissions" ON public.permissions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND p.role = 'superadmin'
  )
);

CREATE POLICY "Superadmins can manage role permissions" ON public.role_permissions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND p.role = 'superadmin'
  )
);

-- Also update the audits policy to avoid recursion
DROP POLICY IF EXISTS "Superadmins can view audits" ON public.audits;
CREATE POLICY "Superadmins can view audits" ON public.audits
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND p.role = 'superadmin'
  )
);
