
-- Update all existing users to be super admins
UPDATE public.profiles 
SET role = 'admin' 
WHERE role IS NULL OR role != 'admin';

-- Ensure all profiles have the admin role by default
ALTER TABLE public.profiles 
ALTER COLUMN role SET DEFAULT 'admin';

-- Update any profiles that might not have a role set
UPDATE public.profiles 
SET role = 'admin' 
WHERE role IS NULL;
