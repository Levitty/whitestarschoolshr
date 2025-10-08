-- Drop existing policies
DROP POLICY IF EXISTS "Superadmins can manage all employee profiles" ON public.employee_profiles;
DROP POLICY IF EXISTS "Users can view their own employee profile" ON public.employee_profiles;

-- Create comprehensive policy for superadmins checking profiles table
CREATE POLICY "Superadmins have full access to employee profiles"
ON public.employee_profiles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'superadmin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'superadmin'
  )
);

-- Create policy for regular users to view their own employee profile
CREATE POLICY "Users can view their own employee profile"
ON public.employee_profiles
FOR SELECT
TO authenticated
USING (
  profile_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'superadmin'
  )
);