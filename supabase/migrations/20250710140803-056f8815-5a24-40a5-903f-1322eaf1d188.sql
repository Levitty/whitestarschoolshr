
-- Add the missing decision_at column to leave_requests table
ALTER TABLE public.leave_requests 
ADD COLUMN IF NOT EXISTS decision_at TIMESTAMP WITH TIME ZONE;

-- Update existing approved/rejected requests to set decision_at = approved_at for consistency
UPDATE public.leave_requests 
SET decision_at = approved_at 
WHERE approved_at IS NOT NULL AND decision_at IS NULL;

-- Add auto-incrementing employee number functionality
-- First, add a sequence for employee numbers
CREATE SEQUENCE IF NOT EXISTS employee_number_seq START 1001;

-- Add a trigger function to auto-generate employee numbers
CREATE OR REPLACE FUNCTION generate_employee_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.employee_number IS NULL OR NEW.employee_number = '' THEN
    NEW.employee_number := 'EMP' || LPAD(nextval('employee_number_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for employee_profiles table
DROP TRIGGER IF EXISTS set_employee_number ON employee_profiles;
CREATE TRIGGER set_employee_number
  BEFORE INSERT ON employee_profiles
  FOR EACH ROW
  EXECUTE FUNCTION generate_employee_number();

-- Update leave_requests table to use decision_at instead of approved_at for consistency
-- Add index for better performance on decision_at
CREATE INDEX IF NOT EXISTS idx_leave_requests_decision_at ON public.leave_requests(decision_at);
