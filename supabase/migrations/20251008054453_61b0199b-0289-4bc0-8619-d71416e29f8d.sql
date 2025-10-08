-- Adjust policies to avoid dependency on 'authenticated' role
DROP POLICY IF EXISTS "Superadmins have full access to employee profiles" ON public.employee_profiles;
DROP POLICY IF EXISTS "Users can view their own employee profile" ON public.employee_profiles;

CREATE POLICY "Superadmins have full access to employee profiles"
ON public.employee_profiles
FOR ALL
TO public
USING (public.is_superadmin(auth.uid()))
WITH CHECK (public.is_superadmin(auth.uid()));

CREATE POLICY "Users can view their own employee profile"
ON public.employee_profiles
FOR SELECT
TO public
USING (
  profile_id = auth.uid() OR public.is_superadmin(auth.uid())
);