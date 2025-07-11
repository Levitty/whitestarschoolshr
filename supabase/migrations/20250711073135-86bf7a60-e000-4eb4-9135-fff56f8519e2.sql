
-- Check current role for mutualevy@gmail.com
SELECT id, email, role, is_active FROM profiles WHERE email = 'mutualevy@gmail.com';

-- Update the role to superadmin
UPDATE profiles 
SET role = 'superadmin' 
WHERE email = 'mutualevy@gmail.com';

-- Verify the update
SELECT id, email, role, is_active FROM profiles WHERE email = 'mutualevy@gmail.com';
