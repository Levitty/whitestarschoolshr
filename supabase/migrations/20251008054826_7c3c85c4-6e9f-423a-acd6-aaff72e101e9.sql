-- Check if the trigger exists and sequence
SELECT EXISTS(SELECT 1 FROM pg_trigger WHERE tgname = 'generate_employee_number_trigger');

-- Make sure sequence exists
CREATE SEQUENCE IF NOT EXISTS employee_number_seq START 1;

-- Recreate the trigger function to handle empty strings
CREATE OR REPLACE FUNCTION public.generate_employee_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Generate employee number if NULL or empty string
  IF NEW.employee_number IS NULL OR NEW.employee_number = '' THEN
    NEW.employee_number := 'EMP' || LPAD(nextval('employee_number_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$function$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS generate_employee_number_trigger ON public.employee_profiles;
CREATE TRIGGER generate_employee_number_trigger
  BEFORE INSERT ON public.employee_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_employee_number();