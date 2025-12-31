-- Update handle_new_user function to include branch
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
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
      branch,
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
      NEW.raw_user_meta_data->>'branch',
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
      branch,
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
      NEW.raw_user_meta_data->>'branch',
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