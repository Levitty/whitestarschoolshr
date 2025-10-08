-- Drop existing problematic policies
DROP POLICY IF EXISTS "Superadmins have full access to employee profiles" ON public.employee_profiles;
DROP POLICY IF EXISTS "Users can view their own employee profile" ON public.employee_profiles;

-- Create a security definer function to check if user is superadmin
CREATE OR REPLACE FUNCTION public.is_superadmin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = user_id
    AND role = 'superadmin'
    AND is_active = true
  )
$$;

-- Create policy for superadmins with full access using the security definer function
CREATE POLICY "Superadmins have full access to employee profiles"
ON public.employee_profiles
FOR ALL
TO authenticated
USING (public.is_superadmin(auth.uid()))
WITH CHECK (public.is_superadmin(auth.uid()));

-- Create policy for users to view their own employee profile
CREATE POLICY "Users can view their own employee profile"
ON public.employee_profiles
FOR SELECT
TO authenticated
USING (
  profile_id = auth.uid() OR public.is_superadmin(auth.uid())
);