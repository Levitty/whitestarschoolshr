-- Create a function to generate tenant-specific employee numbers
CREATE OR REPLACE FUNCTION generate_tenant_employee_number(p_tenant_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tenant_slug text;
  prefix text;
  next_num integer;
  result text;
BEGIN
  -- Get tenant slug
  SELECT slug INTO tenant_slug FROM tenants WHERE id = p_tenant_id;
  
  -- Determine prefix based on tenant
  IF tenant_slug IS NULL OR tenant_slug LIKE '%school%' THEN
    prefix := 'EMP';
  ELSIF tenant_slug LIKE '%enda%' THEN
    prefix := 'ENDA-';
  ELSE
    prefix := UPPER(SUBSTRING(tenant_slug FROM 1 FOR 3)) || '-';
  END IF;
  
  -- Get the next number for this tenant
  SELECT COALESCE(MAX(
    CASE 
      WHEN employee_number ~ ('^' || prefix || '[0-9]+$') THEN
        CAST(REGEXP_REPLACE(employee_number, '^' || prefix || '0*', '') AS integer)
      ELSE 0
    END
  ), 0) + 1 INTO next_num
  FROM employee_profiles 
  WHERE tenant_id = p_tenant_id;
  
  -- Format result with leading zeros
  IF prefix = 'EMP' THEN
    result := prefix || LPAD(next_num::text, 4, '0');
  ELSE
    result := prefix || LPAD(next_num::text, 3, '0');
  END IF;
  
  RETURN result;
END;
$$;

-- Create a trigger function to set employee_number before insert
CREATE OR REPLACE FUNCTION set_employee_number_on_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only generate if employee_number is empty or null
  IF NEW.employee_number IS NULL OR NEW.employee_number = '' THEN
    NEW.employee_number := generate_tenant_employee_number(NEW.tenant_id);
  END IF;
  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists and create new one
DROP TRIGGER IF EXISTS set_employee_number_trigger ON employee_profiles;
CREATE TRIGGER set_employee_number_trigger
  BEFORE INSERT ON employee_profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_employee_number_on_insert();