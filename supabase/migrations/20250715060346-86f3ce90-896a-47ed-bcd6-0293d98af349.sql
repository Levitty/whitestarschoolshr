
-- Update the handle_new_user function to automatically activate superadmin accounts
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
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
      true,  -- Superadmin is active immediately
      'active'  -- Superadmin is active immediately
    );
    
    -- Also confirm the email automatically for superadmin
    UPDATE auth.users 
    SET email_confirmed_at = now(), 
        confirmed_at = now()
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
      false,  -- New users are inactive by default
      'pending'  -- New users need approval
    );
  END IF;
  
  RETURN NEW;
END;
$$;
