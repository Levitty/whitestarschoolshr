-- Create a trigger function to auto-create employee_profiles when a profile is created
CREATE OR REPLACE FUNCTION public.create_employee_profile_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only create employee_profile if tenant_id exists and employee_profile doesn't exist
  IF NEW.tenant_id IS NOT NULL THEN
    -- Check if employee_profile already exists for this user
    IF NOT EXISTS (SELECT 1 FROM employee_profiles WHERE profile_id = NEW.id) THEN
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
        NEW.id,
        COALESCE(NEW.first_name, 'Unknown'),
        COALESCE(NEW.last_name, ''),
        NEW.email,
        NEW.phone,
        COALESCE(NEW.department, 'General'),
        NEW.branch,
        CASE 
          WHEN NEW.role = 'superadmin' THEN 'System Administrator'
          WHEN NEW.role = 'admin' THEN 'Administrator'
          WHEN NEW.role = 'head' THEN 'Department Head'
          WHEN NEW.role = 'teacher' THEN 'Teacher'
          WHEN NEW.role = 'secretary' THEN 'Secretary'
          WHEN NEW.role = 'driver' THEN 'Driver'
          WHEN NEW.role = 'support_staff' THEN 'Support Staff'
          ELSE 'Staff Member'
        END,
        CURRENT_DATE,
        'pending', -- Employee status is pending until profile is approved
        NEW.tenant_id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger on profiles table (after insert)
DROP TRIGGER IF EXISTS create_employee_on_profile_insert ON profiles;
CREATE TRIGGER create_employee_on_profile_insert
AFTER INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION create_employee_profile_on_signup();

-- Also update employee_profiles status when profile is approved
CREATE OR REPLACE FUNCTION public.sync_employee_status_on_profile_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When profile status changes to active, also activate the employee profile
  IF NEW.status = 'active' AND NEW.is_active = true AND (OLD.status != 'active' OR OLD.is_active = false) THEN
    UPDATE employee_profiles 
    SET status = 'active'
    WHERE profile_id = NEW.id;
  END IF;
  
  -- When profile is deactivated, also deactivate the employee profile
  IF (NEW.status = 'inactive' OR NEW.is_active = false) AND (OLD.status = 'active' AND OLD.is_active = true) THEN
    UPDATE employee_profiles 
    SET status = 'inactive'
    WHERE profile_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger on profiles table (after update)
DROP TRIGGER IF EXISTS sync_employee_status_on_profile_change ON profiles;
CREATE TRIGGER sync_employee_status_on_profile_change
AFTER UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION sync_employee_status_on_profile_update();