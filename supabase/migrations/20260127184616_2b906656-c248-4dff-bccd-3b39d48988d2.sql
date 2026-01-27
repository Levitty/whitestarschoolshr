-- Add proof_url column to leave_requests table for storing attachment references
ALTER TABLE public.leave_requests 
ADD COLUMN IF NOT EXISTS proof_url TEXT;

-- Add proof_file_name column to store the original file name
ALTER TABLE public.leave_requests 
ADD COLUMN IF NOT EXISTS proof_file_name TEXT;

-- Create storage policy for leave-proofs bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('leave-proofs', 'leave-proofs', false)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own leave proofs
CREATE POLICY "Users can upload their own leave proofs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'leave-proofs' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow users to view their own leave proofs
CREATE POLICY "Users can view their own leave proofs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'leave-proofs' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow admins/HR to view all leave proofs
CREATE POLICY "Admins can view all leave proofs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'leave-proofs' AND 
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin', 'head')
  )
);