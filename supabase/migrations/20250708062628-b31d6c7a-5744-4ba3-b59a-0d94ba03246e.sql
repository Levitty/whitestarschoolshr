
-- First, let's create a security definer function to get the current user's role
-- This prevents infinite recursion in RLS policies
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create new policies using the security definer function
CREATE POLICY "Admins can insert profiles" ON public.profiles
FOR INSERT
WITH CHECK (public.get_current_user_role() = 'admin' OR auth.uid() = id);

CREATE POLICY "Admins can update all profiles" ON public.profiles
FOR UPDATE
USING (public.get_current_user_role() = 'admin' OR auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT
USING (public.get_current_user_role() = 'admin' OR auth.uid() = id);

-- Also fix the documents policies to prevent similar issues
DROP POLICY IF EXISTS "Admins can manage all documents" ON public.documents;

CREATE POLICY "Admins can manage all documents" ON public.documents
FOR ALL
USING (public.get_current_user_role() = 'admin' OR uploaded_by = auth.uid() OR employee_id = auth.uid() OR recipient_id = auth.uid() OR is_shared = true);
