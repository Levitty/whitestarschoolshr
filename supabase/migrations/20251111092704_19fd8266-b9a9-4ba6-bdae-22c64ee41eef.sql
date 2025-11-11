-- Remove the foreign key constraint on documents.employee_id
-- This allows documents to reference either profiles.id or employee_profiles.id
-- without strict foreign key constraints, which is appropriate for this use case

ALTER TABLE documents 
DROP CONSTRAINT IF EXISTS documents_employee_id_fkey;

-- Add a comment to document this decision
COMMENT ON COLUMN documents.employee_id IS 'Can reference either profiles.id or employee_profiles.id depending on context. No foreign key constraint to allow flexibility.';
