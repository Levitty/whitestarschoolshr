
-- Update the user's role from 'admin' to 'superadmin' to match the application's role system
UPDATE public.profiles 
SET role = 'superadmin' 
WHERE email = 'mutualevy@gmail.com';

-- Also update the default role for new users to be 'superadmin' instead of 'admin'
ALTER TABLE public.profiles 
ALTER COLUMN role SET DEFAULT 'superadmin';
