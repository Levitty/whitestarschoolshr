
-- Update the user mutualevy@gmail.com to be a superadmin
UPDATE profiles 
SET role = 'superadmin', is_active = true 
WHERE email = 'mutualevy@gmail.com';

-- If the profile doesn't exist, let's also check if we need to create it
-- First, let's see what profiles exist for this email
SELECT id, email, role, is_active FROM profiles WHERE email = 'mutualevy@gmail.com';
