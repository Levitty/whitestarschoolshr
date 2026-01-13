-- Drop existing restrictive policies on tenant-assets bucket
DROP POLICY IF EXISTS "Tenant admins can upload assets" ON storage.objects;
DROP POLICY IF EXISTS "Tenant admins can update assets" ON storage.objects;
DROP POLICY IF EXISTS "Tenant admins can delete assets" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view tenant assets" ON storage.objects;

-- Create more permissive upload policy
CREATE POLICY "Tenant admins can upload assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'tenant-assets' AND
  (
    -- Check if user is SaaS admin (can upload to any tenant folder)
    EXISTS (SELECT 1 FROM public.saas_admins WHERE user_id = auth.uid())
    OR
    -- Check if user is tenant admin via tenant_users
    (storage.foldername(name))[1] IN (
      SELECT t.id::text FROM public.tenants t
      INNER JOIN public.tenant_users tu ON tu.tenant_id = t.id
      WHERE tu.user_id = auth.uid() AND tu.is_tenant_admin = true
    )
    OR
    -- Check if user is superadmin/admin for their tenant
    (storage.foldername(name))[1] IN (
      SELECT p.tenant_id::text FROM public.profiles p
      WHERE p.id = auth.uid() 
      AND p.role IN ('superadmin', 'admin')
    )
  )
);

-- Create update policy
CREATE POLICY "Tenant admins can update assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'tenant-assets' AND
  (
    EXISTS (SELECT 1 FROM public.saas_admins WHERE user_id = auth.uid())
    OR
    (storage.foldername(name))[1] IN (
      SELECT t.id::text FROM public.tenants t
      INNER JOIN public.tenant_users tu ON tu.tenant_id = t.id
      WHERE tu.user_id = auth.uid() AND tu.is_tenant_admin = true
    )
    OR
    (storage.foldername(name))[1] IN (
      SELECT p.tenant_id::text FROM public.profiles p
      WHERE p.id = auth.uid() 
      AND p.role IN ('superadmin', 'admin')
    )
  )
);

-- Create delete policy
CREATE POLICY "Tenant admins can delete assets"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'tenant-assets' AND
  (
    EXISTS (SELECT 1 FROM public.saas_admins WHERE user_id = auth.uid())
    OR
    (storage.foldername(name))[1] IN (
      SELECT t.id::text FROM public.tenants t
      INNER JOIN public.tenant_users tu ON tu.tenant_id = t.id
      WHERE tu.user_id = auth.uid() AND tu.is_tenant_admin = true
    )
    OR
    (storage.foldername(name))[1] IN (
      SELECT p.tenant_id::text FROM public.profiles p
      WHERE p.id = auth.uid() 
      AND p.role IN ('superadmin', 'admin')
    )
  )
);

-- Create public read policy for tenant assets
CREATE POLICY "Anyone can view tenant assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'tenant-assets');