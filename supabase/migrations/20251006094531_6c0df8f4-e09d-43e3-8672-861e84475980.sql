-- Drop the incorrect public policy for job_applications
DROP POLICY IF EXISTS "Allow public job application submissions" ON public.job_applications;

-- Create proper policy for anonymous job applications using TO anon
CREATE POLICY "Anonymous can submit applications"
ON public.job_applications
FOR INSERT
TO anon, authenticated
WITH CHECK (true);
