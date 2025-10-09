-- Add employee_number to documents table for linking
ALTER TABLE documents ADD COLUMN IF NOT EXISTS employee_number text;

-- Create index on employee_number in documents for better performance
CREATE INDEX IF NOT EXISTS idx_documents_employee_number ON documents(employee_number);

-- Create index on employee_number in employee_profiles for better performance  
CREATE INDEX IF NOT EXISTS idx_employee_profiles_employee_number ON employee_profiles(employee_number);

-- Create function to get the next employee number
CREATE OR REPLACE FUNCTION get_next_employee_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_num integer;
BEGIN
  -- Get the last employee number value from the sequence
  SELECT last_value + 1 INTO next_num FROM employee_number_seq;
  RETURN 'EMP' || LPAD(next_num::text, 4, '0');
END;
$$;

-- Update existing documents to link via employee_number
UPDATE documents d
SET employee_number = ep.employee_number
FROM employee_profiles ep
WHERE d.employee_id = ep.id
AND d.employee_number IS NULL;