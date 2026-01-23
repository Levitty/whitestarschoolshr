-- Fix the employee_number_seq to start after the highest existing number
DO $$
DECLARE
  max_num INTEGER;
BEGIN
  -- Get the maximum number from existing EMP-prefixed employee numbers
  SELECT COALESCE(MAX(CAST(SUBSTRING(employee_number FROM 4) AS INTEGER)), 0)
  INTO max_num
  FROM employee_profiles
  WHERE employee_number LIKE 'EMP%' AND employee_number ~ '^EMP[0-9]+$';
  
  -- Set the sequence to start after the max (add 1 to ensure next value is unique)
  EXECUTE 'ALTER SEQUENCE employee_number_seq RESTART WITH ' || (max_num + 1);
  
  RAISE NOTICE 'Sequence reset to start at %', max_num + 1;
END $$;

-- Now backfill missing employee_profiles
DO $$
DECLARE
  prof RECORD;
  pos_name TEXT;
BEGIN
  FOR prof IN 
    SELECT p.id, p.first_name, p.last_name, p.email, p.phone, p.department, p.branch, p.role, p.hire_date, p.status, p.is_active, p.tenant_id
    FROM profiles p
    WHERE p.tenant_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM employee_profiles ep WHERE ep.profile_id = p.id)
    ORDER BY p.created_at
  LOOP
    -- Determine position based on role
    pos_name := CASE 
      WHEN prof.role = 'superadmin' THEN 'System Administrator'
      WHEN prof.role = 'admin' THEN 'Administrator'
      WHEN prof.role = 'head' THEN 'Department Head'
      WHEN prof.role = 'teacher' THEN 'Teacher'
      WHEN prof.role = 'secretary' THEN 'Secretary'
      WHEN prof.role = 'driver' THEN 'Driver'
      WHEN prof.role = 'support_staff' THEN 'Support Staff'
      ELSE 'Staff Member'
    END;
    
    -- Insert employee profile (trigger will generate unique employee_number)
    INSERT INTO employee_profiles (
      profile_id,
      first_name,
      last_name,
      email,
      phone,
      department,
      branch,
      position,
      hire_date,
      status,
      tenant_id
    ) VALUES (
      prof.id,
      COALESCE(prof.first_name, 'Unknown'),
      COALESCE(prof.last_name, ''),
      prof.email,
      prof.phone,
      COALESCE(prof.department, 'General'),
      prof.branch,
      pos_name,
      COALESCE(prof.hire_date, CURRENT_DATE),
      CASE WHEN prof.status = 'active' AND prof.is_active = true THEN 'active' ELSE 'pending' END,
      prof.tenant_id
    );
  END LOOP;
END $$;