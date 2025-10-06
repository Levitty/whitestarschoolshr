-- Drop the incorrect public policy
DROP POLICY IF EXISTS "Public can upload CVs" ON storage.objects;

-- Create proper policy for anonymous CV uploads using TO anon
CREATE POLICY "Anonymous can upload CVs"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'cv-uploads');

-- Ensure anon can also read from public cv-uploads bucket
CREATE POLICY "Anyone can view CVs" 
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'cv-uploads');
