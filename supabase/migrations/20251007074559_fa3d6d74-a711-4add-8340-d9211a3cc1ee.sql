-- Drop existing policy
DROP POLICY IF EXISTS "Superadmins can manage employee profiles" ON public.employee_profiles;

-- Create comprehensive policy for superadmins (ALL operations)
CREATE POLICY "Superadmins can manage all employee profiles"
ON public.employee_profiles
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'superadmin'::app_role)
)
WITH CHECK (
  public.has_role(auth.uid(), 'superadmin'::app_role)
);

-- Create policy for regular users to view their own employee profile
CREATE POLICY "Users can view their own employee profile"
ON public.employee_profiles
FOR SELECT
TO authenticated
USING (
  profile_id = auth.uid()
);