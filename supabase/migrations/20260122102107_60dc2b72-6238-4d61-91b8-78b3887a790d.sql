-- Create login_attempts table for auditing login activity
CREATE TABLE public.login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  tenant_id UUID REFERENCES public.tenants(id),
  success BOOLEAN NOT NULL DEFAULT false,
  error_type TEXT, -- 'invalid_credentials', 'email_not_confirmed', 'account_pending', 'account_suspended', 'profile_error'
  error_message TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_login_attempts_email ON public.login_attempts(email);
CREATE INDEX idx_login_attempts_tenant_id ON public.login_attempts(tenant_id);
CREATE INDEX idx_login_attempts_created_at ON public.login_attempts(created_at DESC);

-- Enable RLS
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert login attempts (needed for failed logins before auth)
CREATE POLICY "Anyone can log login attempts"
ON public.login_attempts
FOR INSERT
WITH CHECK (true);

-- Only superadmins and tenant admins can view login attempts for their tenant
CREATE POLICY "Admins can view login attempts for their tenant"
ON public.login_attempts
FOR SELECT
USING (
  public.is_superadmin(auth.uid()) 
  OR public.is_tenant_admin(auth.uid())
  OR (
    tenant_id IS NOT NULL 
    AND tenant_id = public.get_user_tenant_id()
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('superadmin', 'admin', 'head')
    )
  )
);