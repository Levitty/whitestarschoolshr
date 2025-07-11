
-- Create profiles table with role-based access
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  full_name text NOT NULL,
  department text,
  role text CHECK (role IN ('superadmin', 'head', 'teacher', 'staff')) DEFAULT 'staff',
  status text DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id)
);

-- Create trigger function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, department, role, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'department', ''),
    'staff',
    'pending'
  );
  RETURN NEW;
END;
$$;

-- Create trigger to execute function on user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles table
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Superadmins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id = auth.uid() AND p.role = 'superadmin' AND p.status = 'active'
    )
  );

CREATE POLICY "Users can update their own non-role fields" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id AND 
    role = (SELECT role FROM public.profiles WHERE user_id = auth.uid()) -- Prevent role changes
  );

CREATE POLICY "Superadmins can update any profile" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id = auth.uid() AND p.role = 'superadmin' AND p.status = 'active'
    )
  );

-- Update existing tables to enable RLS and add role-based policies
ALTER TABLE public.employee_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies on employee_profiles to replace with role-based ones
DROP POLICY IF EXISTS "Anyone can create employee profiles" ON public.employee_profiles;
DROP POLICY IF EXISTS "Anyone can update employee profiles" ON public.employee_profiles;
DROP POLICY IF EXISTS "Anyone can view employee profiles" ON public.employee_profiles;

CREATE POLICY "Superadmins can manage all employee profiles" ON public.employee_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id = auth.uid() AND p.role = 'superadmin' AND p.status = 'active'
    )
  );

CREATE POLICY "Heads can manage department employee profiles" ON public.employee_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id = auth.uid() AND p.role = 'head' AND p.status = 'active'
      AND p.department = employee_profiles.department
    )
  );

CREATE POLICY "Users can view their own employee profile" ON public.employee_profiles
  FOR SELECT USING (
    profile_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id = auth.uid() AND p.email = employee_profiles.email
    )
  );

-- Update documents table policies
DROP POLICY IF EXISTS "Admins can manage all documents" ON public.documents;

CREATE POLICY "Superadmins can manage all documents" ON public.documents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id = auth.uid() AND p.role = 'superadmin' AND p.status = 'active'
    )
  );

CREATE POLICY "Heads can manage department documents" ON public.documents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id = auth.uid() AND p.role = 'head' AND p.status = 'active'
    ) OR uploaded_by = auth.uid() OR employee_id = auth.uid() OR recipient_id = auth.uid() OR is_shared = true
  );

CREATE POLICY "Users can manage their own documents" ON public.documents
  FOR ALL USING (uploaded_by = auth.uid() OR employee_id = auth.uid() OR recipient_id = auth.uid() OR is_shared = true);

-- Create updated_at trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
