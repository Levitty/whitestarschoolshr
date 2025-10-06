-- Add phone number column to job_applications table
ALTER TABLE job_applications 
ADD COLUMN phone_number text;

COMMENT ON COLUMN job_applications.phone_number IS 'Candidate phone number';