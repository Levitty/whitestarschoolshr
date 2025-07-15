
-- Fix the storage policies for CV uploads
-- First, let's check and update the storage policies for the cv-uploads bucket

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can upload CVs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view CVs" ON storage.objects;

-- Create proper policies for CV uploads that work for anonymous users
CREATE POLICY "Allow CV uploads to cv-uploads bucket" ON storage.objects
FOR INSERT 
WITH CHECK (bucket_id = 'cv-uploads');

CREATE POLICY "Allow reading CVs from cv-uploads bucket" ON storage.objects
FOR SELECT 
USING (bucket_id = 'cv-uploads');

-- Also ensure the bucket exists and is properly configured
INSERT INTO storage.buckets (id, name, public) 
VALUES ('cv-uploads', 'cv-uploads', false)
ON CONFLICT (id) DO NOTHING;
