
-- Update the profiles table to use the new role structure and add status tracking
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add status column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'status') THEN
        ALTER TABLE profiles ADD COLUMN status TEXT DEFAULT 'pending';
    END IF;
END $$;

-- Update role column to handle new roles
ALTER TABLE profiles ALTER COLUMN role DROP DEFAULT;
ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'staff';

-- Add check constraint for valid roles
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('superadmin', 'admin', 'head', 'teacher', 'staff', 'secretary', 'driver', 'support_staff'));

-- Add check constraint for valid status
ALTER TABLE profiles ADD CONSTRAINT profiles_status_check 
CHECK (status IN ('pending', 'active', 'inactive', 'suspended'));

-- Update existing profiles to have active status if they don't have a status set
UPDATE profiles SET status = 'active' WHERE status IS NULL OR status = '';

-- Update the handle_new_user function to set proper defaults for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
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
  RETURN NEW;
END;
$function$;
