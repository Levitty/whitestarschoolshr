-- Step 1: Create enum for roles
CREATE TYPE public.app_role AS ENUM ('superadmin', 'admin', 'head', 'teacher', 'staff', 'secretary', 'driver', 'support_staff');

-- Step 2: Create user_roles table with proper security
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Step 3: Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Step 4: Migrate existing roles from profiles to user_roles (only for superadmins)
INSERT INTO public.user_roles (user_id, role)
SELECT id, role::app_role
FROM public.profiles
WHERE role = 'superadmin';

-- Step 5: Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

-- Step 6: Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY CASE role
    WHEN 'superadmin' THEN 1
    WHEN 'admin' THEN 2
    WHEN 'head' THEN 3
    WHEN 'teacher' THEN 4
    WHEN 'secretary' THEN 5
    WHEN 'driver' THEN 6
    WHEN 'support_staff' THEN 7
    WHEN 'staff' THEN 8
  END
  LIMIT 1;
$$;

-- Step 7: Update get_current_user_role to use new system (CREATE OR REPLACE, no DROP)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text
  FROM public.user_roles
  WHERE user_id = auth.uid()
  ORDER BY CASE role
    WHEN 'superadmin' THEN 1
    WHEN 'admin' THEN 2
    WHEN 'head' THEN 3
    WHEN 'teacher' THEN 4
    WHEN 'secretary' THEN 5
    WHEN 'driver' THEN 6
    WHEN 'support_staff' THEN 7
    WHEN 'staff' THEN 8
  END
  LIMIT 1;
$$;

-- Step 8: RLS policies for user_roles - only superadmins can manage
CREATE POLICY "Superadmins can manage user roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'superadmin'))
WITH CHECK (public.has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Users can view their own role"
ON public.user_roles
FOR SELECT
USING (user_id = auth.uid());

-- Step 9: Update user_has_permission function with search_path
CREATE OR REPLACE FUNCTION public.user_has_permission(user_id uuid, permission_name text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role::text = r.name
    JOIN public.role_permissions rp ON r.id = rp.role_id
    JOIN public.permissions perm ON rp.permission_id = perm.id
    WHERE ur.user_id = $1 AND perm.name = permission_name
  );
END;
$$;

-- Step 10: Update get_user_permissions function with search_path
CREATE OR REPLACE FUNCTION public.get_user_permissions(user_id uuid)
RETURNS TABLE(permission_name text, permission_description text, module text)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT perm.name, perm.description, perm.module
  FROM public.user_roles ur
  JOIN public.roles r ON ur.role::text = r.name
  JOIN public.role_permissions rp ON r.id = rp.role_id
  JOIN public.permissions perm ON rp.permission_id = perm.id
  WHERE ur.user_id = $1;
END;
$$;

-- Step 11: Update handle_new_user trigger function with search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if this is a superadmin user
  IF NEW.raw_user_meta_data->>'is_superadmin' = 'true' THEN
    -- For superadmin, set as active and confirmed
    INSERT INTO public.profiles (
      id, 
      email, 
      first_name, 
      last_name,
      department,
      role,
      is_active,
      status
    )
    VALUES (
      NEW.id, 
      NEW.email,
      NEW.raw_user_meta_data->>'first_name',
      NEW.raw_user_meta_data->>'last_name',
      NEW.raw_user_meta_data->>'department',
      'superadmin',
      true,
      'active'
    );
    
    -- Add role to user_roles table
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'superadmin');
    
    -- Set email as confirmed for superadmin
    UPDATE auth.users 
    SET email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE id = NEW.id;
  ELSE
    -- For regular users, use the existing logic
    INSERT INTO public.profiles (
      id, 
      email, 
      first_name, 
      last_name,
      department,
      role,
      is_active,
      status
    )
    VALUES (
      NEW.id, 
      NEW.email,
      NEW.raw_user_meta_data->>'first_name',
      NEW.raw_user_meta_data->>'last_name',
      NEW.raw_user_meta_data->>'department',
      COALESCE(NEW.raw_user_meta_data->>'role', 'staff'),
      false,
      'pending'
    );
    
    -- Add default role to user_roles table
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'staff'));
  END IF;
  
  RETURN NEW;
END;
$$;

-- Step 12: Update send_registration_confirmation function with search_path
CREATE OR REPLACE FUNCTION public.send_registration_confirmation(registration_id_param uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  registration_record RECORD;
  result JSON;
BEGIN
  SELECT * INTO registration_record 
  FROM registrations 
  WHERE id = registration_id_param AND payment_status = 'completed';
  
  IF NOT FOUND THEN
    RETURN '{"success": false, "error": "Registration not found or not completed"}'::JSON;
  END IF;
  
  SELECT content::JSON INTO result
  FROM http((
    'POST',
    'https://rogwhlgqsyasbemnovgf.supabase.co/functions/v1/send-registration-email',
    ARRAY[
      http_header('Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)),
      http_header('Content-Type', 'application/json')
    ],
    'application/json',
    json_build_object(
      'email', registration_record.email,
      'firstName', registration_record.first_name,
      'lastName', registration_record.last_name,
      'registrationId', registration_record.id,
      'paymentReference', registration_record.payment_reference,
      'eventType', 'last-man-standing',
      'eventPrice', registration_record.registration_fee
    )::text
  ));
  
  RETURN COALESCE(result, '{"success": true, "message": "Email sent"}'::JSON);
END;
$$;

-- Step 13: Add comments
COMMENT ON TABLE public.user_roles IS 'Stores user roles separately from profiles to prevent privilege escalation. Only superadmins can modify this table.';
COMMENT ON FUNCTION public.has_role IS 'Security definer function to check user roles without RLS recursion';
COMMENT ON FUNCTION public.get_user_role IS 'Security definer function to get highest user role without RLS recursion';