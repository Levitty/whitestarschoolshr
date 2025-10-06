-- Make CV bucket publicly readable to match getPublicUrl usage
UPDATE storage.buckets SET public = true WHERE id = 'cv-uploads';

-- Keep anonymous uploads enabled (already created), ensure it exists
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public can upload CVs'
  ) THEN
    CREATE POLICY "Public can upload CVs"
    ON storage.objects
    FOR INSERT
    TO public
    WITH CHECK (bucket_id = 'cv-uploads');
  END IF;
END $$;
