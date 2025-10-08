-- Update RLS policies to allow both superadmin AND admin access
DROP POLICY IF EXISTS "Superadmins can manage employee profiles" ON public.employee_profiles;
DROP POLICY IF EXISTS "Users can view employee profiles" ON public.employee_profiles;

-- Create policies that allow both superadmin and admin access
CREATE POLICY "Admins and superadmins can manage employee profiles"
ON public.employee_profiles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('superadmin', 'admin')
    AND profiles.is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('superadmin', 'admin')
    AND profiles.is_active = true
  )
);

-- Policy for users to view their own profile OR admins/superadmins to view all
CREATE POLICY "Users can view employee profiles"
ON public.employee_profiles
FOR SELECT
TO authenticated
USING (
  -- Users can view their own profile OR admins/superadmins can view all
  profile_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('superadmin', 'admin')
    AND profiles.is_active = true
  )
);