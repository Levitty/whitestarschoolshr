
-- Drop the existing restrictive policy that's blocking submissions
DROP POLICY IF EXISTS "Anyone can create job applications" ON job_applications;

-- Create a new policy that truly allows anyone to insert job applications
CREATE POLICY "Public can submit job applications" ON job_applications
FOR INSERT 
WITH CHECK (true);

-- Ensure admins can still view and manage applications
CREATE POLICY IF NOT EXISTS "Admins can view job applications" ON job_applications
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'superadmin')
  )
);

CREATE POLICY IF NOT EXISTS "Admins can update job applications" ON job_applications
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'superadmin')
  )
);
