
-- First, let's disable RLS temporarily to test
ALTER TABLE job_applications DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow public job application submissions" ON job_applications;
DROP POLICY IF EXISTS "Admins can view job applications" ON job_applications;
DROP POLICY IF EXISTS "Admins can update job applications" ON job_applications;

-- Create a very simple and permissive INSERT policy for anyone
CREATE POLICY "job_applications_insert_policy" ON job_applications
FOR INSERT 
WITH CHECK (true);

-- Create SELECT policy for admins only
CREATE POLICY "job_applications_select_policy" ON job_applications
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'superadmin')
  )
);

-- Create UPDATE policy for admins only
CREATE POLICY "job_applications_update_policy" ON job_applications
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'superadmin')
  )
);

-- Also ensure the storage bucket allows anonymous uploads
CREATE POLICY IF NOT EXISTS "cv_uploads_insert_policy" ON storage.objects
FOR INSERT 
WITH CHECK (bucket_id = 'cv-uploads');

CREATE POLICY IF NOT EXISTS "cv_uploads_select_policy" ON storage.objects
FOR SELECT 
USING (bucket_id = 'cv-uploads');
