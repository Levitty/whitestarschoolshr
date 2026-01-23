-- Fix the user theforgeprojectltd@gmail.com - activate their profile
UPDATE profiles 
SET status = 'active', is_active = true 
WHERE id = '4e188ba2-ea99-42fd-8f28-9b9bf9663525';

-- Create employee_profiles entry for this user with a unique employee number
INSERT INTO employee_profiles (
  profile_id,
  employee_number,
  first_name,
  last_name,
  email,
  department,
  position,
  hire_date,
  status,
  tenant_id
)
SELECT 
  p.id,
  'EMP' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(employee_number FROM 4) AS INTEGER)), 0) + 1 FROM employee_profiles WHERE employee_number LIKE 'EMP%')::text, 4, '0'),
  COALESCE(p.first_name, 'The Forge'),
  COALESCE(p.last_name, 'Project'),
  p.email,
  COALESCE(p.department, 'General'),
  'Staff Member',
  CURRENT_DATE,
  'active',
  p.tenant_id
FROM profiles p
WHERE p.id = '4e188ba2-ea99-42fd-8f28-9b9bf9663525'
AND NOT EXISTS (
  SELECT 1 FROM employee_profiles ep WHERE ep.profile_id = p.id
);