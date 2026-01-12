-- Add favicon_url column to tenants table
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS favicon_url TEXT;

-- Create storage bucket for tenant assets (logos, favicons)
INSERT INTO storage.buckets (id, name, public)
VALUES ('tenant-assets', 'tenant-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to their tenant folder
CREATE POLICY "Tenant admins can upload assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'tenant-assets' AND
  (storage.foldername(name))[1] IN (
    SELECT t.id::text FROM tenants t
    INNER JOIN tenant_users tu ON tu.tenant_id = t.id
    WHERE tu.user_id = auth.uid() AND tu.is_tenant_admin = true
  )
);

-- Allow authenticated users to update their tenant assets
CREATE POLICY "Tenant admins can update assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'tenant-assets' AND
  (storage.foldername(name))[1] IN (
    SELECT t.id::text FROM tenants t
    INNER JOIN tenant_users tu ON tu.tenant_id = t.id
    WHERE tu.user_id = auth.uid() AND tu.is_tenant_admin = true
  )
);

-- Allow authenticated users to delete their tenant assets
CREATE POLICY "Tenant admins can delete assets"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'tenant-assets' AND
  (storage.foldername(name))[1] IN (
    SELECT t.id::text FROM tenants t
    INNER JOIN tenant_users tu ON tu.tenant_id = t.id
    WHERE tu.user_id = auth.uid() AND tu.is_tenant_admin = true
  )
);

-- Allow public read access to tenant assets (favicons, logos need to be public)
CREATE POLICY "Public can view tenant assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'tenant-assets');