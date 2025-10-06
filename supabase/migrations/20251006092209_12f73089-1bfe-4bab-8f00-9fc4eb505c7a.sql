-- Ensure job applications can be submitted by public clients (desktop/mobile)
-- Recreate policy to explicitly allow public INSERTs
DROP POLICY IF EXISTS "Allow public job application submissions" ON public.job_applications;
CREATE POLICY "Allow public job application submissions"
ON public.job_applications
FOR INSERT
TO public
WITH CHECK (true);

-- Storage policies for CV uploads: allow uploads without requiring auth
-- Note: Bucket 'cv-uploads' is private. This enables uploads only; reading should be restricted to authenticated admins in-app.
-- You can later decide if public reads are desired; current app uses getPublicUrl, but we'll keep reads restricted for security.

-- Allow anyone (including anon/mobile) to upload to the 'cv-uploads' bucket
DROP POLICY IF EXISTS "Public can upload CVs" ON storage.objects;
CREATE POLICY "Public can upload CVs"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'cv-uploads');

-- Allow admins and superadmins to read CVs in-app
DROP POLICY IF EXISTS "Admins can view CVs" ON storage.objects;
CREATE POLICY "Admins can view CVs"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'cv-uploads'
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('admin','superadmin')
  )
);
