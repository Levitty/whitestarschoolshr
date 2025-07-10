
-- Create an enum for the different user roles
CREATE TYPE public.user_role AS ENUM ('admin', 'manager', 'staff');

-- Update the profiles table to use the new role enum and set admin as default
ALTER TABLE public.profiles 
ALTER COLUMN role TYPE user_role USING role::user_role,
ALTER COLUMN role SET DEFAULT 'staff';

-- Update existing profiles to have proper roles (keeping admins as admin, others as staff)
UPDATE public.profiles 
SET role = 'admin'::user_role 
WHERE role = 'admin';

UPDATE public.profiles 
SET role = 'staff'::user_role 
WHERE role IS NULL OR role NOT IN ('admin');

-- Add additional profile fields for better user management
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS job_title TEXT,
ADD COLUMN IF NOT EXISTS salary_grade TEXT,
ADD COLUMN IF NOT EXISTS direct_reports INTEGER DEFAULT 0;

-- Create a security definer function to get user role (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID DEFAULT auth.uid())
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Update RLS policies to use the new role system
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Create new role-based policies
CREATE POLICY "Admins can manage all profiles" ON public.profiles
FOR ALL
USING (public.get_user_role() = 'admin' OR auth.uid() = id);

CREATE POLICY "Managers can view their reports" ON public.profiles
FOR SELECT
USING (
  public.get_user_role() = 'admin' OR 
  auth.uid() = id OR 
  (public.get_user_role() = 'manager' AND manager_id = auth.uid())
);

-- Update employee_profiles policies for role-based access
DROP POLICY IF EXISTS "Anyone can view employee profiles" ON public.employee_profiles;
DROP POLICY IF EXISTS "Anyone can create employee profiles" ON public.employee_profiles;
DROP POLICY IF EXISTS "Anyone can update employee profiles" ON public.employee_profiles;

CREATE POLICY "Role-based employee profile access" ON public.employee_profiles
FOR SELECT
USING (
  public.get_user_role() = 'admin' OR
  (public.get_user_role() = 'manager' AND profile_id IN (
    SELECT id FROM public.profiles WHERE manager_id = auth.uid()
  )) OR
  profile_id = auth.uid()
);

CREATE POLICY "Admins can manage employee profiles" ON public.employee_profiles
FOR ALL
USING (public.get_user_role() = 'admin');

-- Update documents policies for role-based access
DROP POLICY IF EXISTS "Admins can manage all documents" ON public.documents;

CREATE POLICY "Role-based document access" ON public.documents
FOR SELECT
USING (
  public.get_user_role() = 'admin' OR
  uploaded_by = auth.uid() OR
  employee_id = auth.uid() OR
  recipient_id = auth.uid() OR
  is_shared = true OR
  (public.get_user_role() = 'manager' AND employee_id IN (
    SELECT id FROM public.profiles WHERE manager_id = auth.uid()
  ))
);

CREATE POLICY "Users can upload documents" ON public.documents
FOR INSERT
WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Admins and managers can manage documents" ON public.documents
FOR UPDATE
USING (
  public.get_user_role() = 'admin' OR
  uploaded_by = auth.uid() OR
  (public.get_user_role() = 'manager' AND employee_id IN (
    SELECT id FROM public.profiles WHERE manager_id = auth.uid()
  ))
);

-- Update leave requests policies
DROP POLICY IF EXISTS "Admins can manage all leave requests" ON public.leave_requests;

CREATE POLICY "Role-based leave request access" ON public.leave_requests
FOR SELECT
USING (
  public.get_user_role() = 'admin' OR
  employee_id = auth.uid() OR
  (public.get_user_role() = 'manager' AND employee_id IN (
    SELECT id FROM public.profiles WHERE manager_id = auth.uid()
  ))
);

CREATE POLICY "Managers and admins can approve leave" ON public.leave_requests
FOR UPDATE
USING (
  public.get_user_role() = 'admin' OR
  (public.get_user_role() = 'manager' AND employee_id IN (
    SELECT id FROM public.profiles WHERE manager_id = auth.uid()
  ))
);
