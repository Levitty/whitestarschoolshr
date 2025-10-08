-- Drop and recreate policies with proper role targeting
DROP POLICY IF EXISTS "Superadmins have full access to employee profiles" ON public.employee_profiles;
DROP POLICY IF EXISTS "Users can view their own employee profile" ON public.employee_profiles;

-- Create policies targeting 'authenticated' role properly
CREATE POLICY "Superadmins can manage employee profiles"
ON public.employee_profiles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'superadmin'
    AND profiles.is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'superadmin'
    AND profiles.is_active = true
  )
);

-- Separate policy for viewing
CREATE POLICY "Users can view employee profiles"
ON public.employee_profiles
FOR SELECT
TO authenticated
USING (
  -- Users can view their own profile OR superadmins can view all
  profile_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'superadmin'
    AND profiles.is_active = true
  )
);