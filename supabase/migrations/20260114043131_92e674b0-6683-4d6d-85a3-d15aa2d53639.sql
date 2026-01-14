-- Allow anonymous users to insert new tenants during self-registration
-- This is needed because the user doesn't exist yet when registering

-- Drop existing policies on tenants table if they exist
DROP POLICY IF EXISTS "Public can insert tenants for registration" ON public.tenants;

-- Allow anyone to insert a tenant (for self-registration flow)
CREATE POLICY "Public can insert tenants for registration"
ON public.tenants
FOR INSERT
WITH CHECK (true);

-- Allow public to check if a slug exists (for validation during registration)
DROP POLICY IF EXISTS "Public can check tenant slugs" ON public.tenants;
CREATE POLICY "Public can check tenant slugs"
ON public.tenants
FOR SELECT
USING (true);