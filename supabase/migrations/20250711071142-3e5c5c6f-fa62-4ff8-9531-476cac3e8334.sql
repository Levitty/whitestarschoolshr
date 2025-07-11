
-- Update the profiles table to ensure role column has proper constraints
ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'staff';

-- Add a check constraint to ensure only valid roles are used
ALTER TABLE profiles ADD CONSTRAINT valid_roles CHECK (role IN ('superadmin', 'head', 'teacher', 'staff'));

-- Create an index on role for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Update any existing admin roles to superadmin
UPDATE profiles SET role = 'superadmin' WHERE role = 'admin';
