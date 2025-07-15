
-- First, let's completely clean up all existing policies on job_applications
DROP POLICY IF EXISTS "Anyone can create job applications" ON job_applications;
DROP POLICY IF EXISTS "Public can submit job applications" ON job_applications;
DROP POLICY IF EXISTS "Admins can view job applications" ON job_applications;
DROP POLICY IF EXISTS "Admins can view all job applications" ON job_applications;
DROP POLICY IF EXISTS "Admins can update job applications" ON job_applications;

-- Now create fresh, simple policies that will definitely work
-- Allow ANYONE (including anonymous users) to insert job applications
CREATE POLICY "Allow public job application submissions" ON job_applications
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Allow admins and superadmins to view applications
CREATE POLICY "Admins can view job applications" ON job_applications
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'superadmin')
  )
);

-- Allow admins and superadmins to update applications
CREATE POLICY "Admins can update job applications" ON job_applications
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'superadmin')
  )
);
