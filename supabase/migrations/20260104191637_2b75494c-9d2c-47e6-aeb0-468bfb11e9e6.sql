-- =====================================================
-- PART A: BACKFILL MISSING EMPLOYEE PROFILES
-- Using row_number() to generate unique employee numbers
-- =====================================================

-- First, get the current max employee number
DO $$
DECLARE
  max_num INTEGER;
  ws_tenant_id UUID;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(employee_number FROM 4) AS INTEGER)), 1000) INTO max_num FROM employee_profiles;
  
  -- Create employee_profiles for approved users who don't have one
  INSERT INTO employee_profiles (
    profile_id, employee_number, first_name, last_name, email, phone,
    department, position, hire_date, status, branch
  )
  SELECT 
    p.id,
    'EMP' || LPAD((max_num + ROW_NUMBER() OVER (ORDER BY p.created_at))::text, 4, '0'),
    COALESCE(p.first_name, split_part(p.email, '@', 1)),
    COALESCE(p.last_name, ''),
    p.email,
    p.phone,
    COALESCE(p.department, 'General'),
    CASE p.role
      WHEN 'head' THEN 'Head Teacher'
      WHEN 'deputy_head' THEN 'Deputy Head Teacher'
      WHEN 'teacher' THEN 'Teacher'
      WHEN 'secretary' THEN 'Secretary'
      WHEN 'driver' THEN 'Driver'
      WHEN 'support_staff' THEN 'Support Staff'
      WHEN 'staff' THEN 'Staff Member'
      ELSE 'Staff Member'
    END,
    COALESCE(p.hire_date, p.created_at::date),
    'active',
    p.branch
  FROM profiles p
  LEFT JOIN employee_profiles ep ON ep.profile_id = p.id
  WHERE p.status = 'active' 
    AND p.is_active = true 
    AND ep.id IS NULL
    AND p.role NOT IN ('superadmin', 'admin');
END $$;

-- =====================================================
-- PART B: CREATE MULTI-TENANT SAAS INFRASTRUCTURE
-- =====================================================

-- B1. Create tenants table
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#3B82F6',
  settings JSONB DEFAULT '{}',
  subscription_tier TEXT DEFAULT 'trial' CHECK (subscription_tier IN ('trial', 'basic', 'professional', 'enterprise')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'past_due', 'canceled', 'suspended')),
  subscription_ends_at TIMESTAMPTZ,
  max_employees INTEGER DEFAULT 50,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- B2. Create saas_admins table (Platform administrators)
CREATE TABLE IF NOT EXISTS saas_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  access_level TEXT DEFAULT 'full' CHECK (access_level IN ('full', 'readonly', 'support')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- B3. Create tenant_users table (Maps users to tenants)
CREATE TABLE IF NOT EXISTS tenant_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  is_tenant_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, user_id)
);

-- Enable RLS on new tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE saas_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- B4. CREATE SECURITY FUNCTIONS
-- =====================================================

-- Check if current user is a SaaS admin
CREATE OR REPLACE FUNCTION is_saas_admin()
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM saas_admins WHERE user_id = auth.uid()
  )
$$;

-- Get current user's tenant ID
CREATE OR REPLACE FUNCTION get_user_tenant_id()
RETURNS UUID
LANGUAGE SQL STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id FROM tenant_users 
  WHERE user_id = auth.uid() 
  LIMIT 1
$$;

-- Check if user is member of a specific tenant
CREATE OR REPLACE FUNCTION is_tenant_member(_tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM tenant_users 
    WHERE user_id = auth.uid() AND tenant_id = _tenant_id
  )
$$;

-- =====================================================
-- B5. CREATE FIRST TENANT (WHITE STAR SCHOOLS)
-- =====================================================

INSERT INTO tenants (name, slug, subscription_tier, subscription_status, max_employees, is_active)
VALUES (
  'White Star Schools',
  'whitestar-schools',
  'professional',
  'active',
  200,
  true
)
ON CONFLICT (slug) DO NOTHING;

-- B6. SET UP SAAS ADMIN (mutualevy@gmail.com)
INSERT INTO saas_admins (user_id, email, full_name, access_level)
VALUES (
  '3a5e9015-0ed1-49b5-84d4-f7edd403d308',
  'mutualevy@gmail.com',
  'Levy Mutua',
  'full'
)
ON CONFLICT (user_id) DO NOTHING;

-- =====================================================
-- B7. ADD TENANT_ID TO ALL DATA TABLES
-- =====================================================

-- Add tenant_id column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
UPDATE profiles SET tenant_id = (SELECT id FROM tenants WHERE slug = 'whitestar-schools') WHERE tenant_id IS NULL;

-- Add tenant_id column to employee_profiles
ALTER TABLE employee_profiles ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
UPDATE employee_profiles SET tenant_id = (SELECT id FROM tenants WHERE slug = 'whitestar-schools') WHERE tenant_id IS NULL;

-- Add tenant_id column to documents
ALTER TABLE documents ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
UPDATE documents SET tenant_id = (SELECT id FROM tenants WHERE slug = 'whitestar-schools') WHERE tenant_id IS NULL;

-- Add tenant_id column to departments
ALTER TABLE departments ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
UPDATE departments SET tenant_id = (SELECT id FROM tenants WHERE slug = 'whitestar-schools') WHERE tenant_id IS NULL;

-- Add tenant_id column to evaluations
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
UPDATE evaluations SET tenant_id = (SELECT id FROM tenants WHERE slug = 'whitestar-schools') WHERE tenant_id IS NULL;

-- Add tenant_id column to job_listings
ALTER TABLE job_listings ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
UPDATE job_listings SET tenant_id = (SELECT id FROM tenants WHERE slug = 'whitestar-schools') WHERE tenant_id IS NULL;

-- Add tenant_id column to job_applications
ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
UPDATE job_applications SET tenant_id = (SELECT id FROM tenants WHERE slug = 'whitestar-schools') WHERE tenant_id IS NULL;

-- Add tenant_id column to leave_requests
ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
UPDATE leave_requests SET tenant_id = (SELECT id FROM tenants WHERE slug = 'whitestar-schools') WHERE tenant_id IS NULL;

-- Add tenant_id column to leave_balances
ALTER TABLE leave_balances ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
UPDATE leave_balances SET tenant_id = (SELECT id FROM tenants WHERE slug = 'whitestar-schools') WHERE tenant_id IS NULL;

-- Add tenant_id column to interviews
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
UPDATE interviews SET tenant_id = (SELECT id FROM tenants WHERE slug = 'whitestar-schools') WHERE tenant_id IS NULL;

-- Add tenant_id column to interview_records
ALTER TABLE interview_records ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
UPDATE interview_records SET tenant_id = (SELECT id FROM tenants WHERE slug = 'whitestar-schools') WHERE tenant_id IS NULL;

-- Add tenant_id column to tickets
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
UPDATE tickets SET tenant_id = (SELECT id FROM tenants WHERE slug = 'whitestar-schools') WHERE tenant_id IS NULL;

-- Add tenant_id column to notifications
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
UPDATE notifications SET tenant_id = (SELECT id FROM tenants WHERE slug = 'whitestar-schools') WHERE tenant_id IS NULL;

-- Add tenant_id column to document_templates
ALTER TABLE document_templates ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
UPDATE document_templates SET tenant_id = (SELECT id FROM tenants WHERE slug = 'whitestar-schools') WHERE tenant_id IS NULL;

-- Add tenant_id column to letter_templates
ALTER TABLE letter_templates ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
UPDATE letter_templates SET tenant_id = (SELECT id FROM tenants WHERE slug = 'whitestar-schools') WHERE tenant_id IS NULL;

-- Add tenant_id column to letterhead_settings
ALTER TABLE letterhead_settings ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
UPDATE letterhead_settings SET tenant_id = (SELECT id FROM tenants WHERE slug = 'whitestar-schools') WHERE tenant_id IS NULL;

-- Add tenant_id column to weekly_reports
ALTER TABLE weekly_reports ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
UPDATE weekly_reports SET tenant_id = (SELECT id FROM tenants WHERE slug = 'whitestar-schools') WHERE tenant_id IS NULL;

-- Add tenant_id column to letter_categories
ALTER TABLE letter_categories ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
UPDATE letter_categories SET tenant_id = (SELECT id FROM tenants WHERE slug = 'whitestar-schools') WHERE tenant_id IS NULL;

-- Add tenant_id column to recruitment_assessments
ALTER TABLE recruitment_assessments ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
UPDATE recruitment_assessments SET tenant_id = (SELECT id FROM tenants WHERE slug = 'whitestar-schools') WHERE tenant_id IS NULL;

-- =====================================================
-- B8. LINK ALL EXISTING USERS TO WHITE STAR TENANT
-- =====================================================

INSERT INTO tenant_users (tenant_id, user_id, is_tenant_admin)
SELECT 
  (SELECT id FROM tenants WHERE slug = 'whitestar-schools'),
  p.id,
  (p.role IN ('superadmin', 'admin'))
FROM profiles p
WHERE p.is_active = true
ON CONFLICT (tenant_id, user_id) DO NOTHING;

-- =====================================================
-- B9. RLS POLICIES FOR NEW TABLES
-- =====================================================

-- Tenants table policies
CREATE POLICY "SaaS admins can manage all tenants" ON tenants
FOR ALL USING (is_saas_admin());

CREATE POLICY "Tenant members can view their tenant" ON tenants
FOR SELECT USING (is_tenant_member(id) OR is_saas_admin());

-- SaaS admins table policies
CREATE POLICY "SaaS admins can view saas_admins" ON saas_admins
FOR SELECT USING (is_saas_admin());

CREATE POLICY "Only system can manage saas_admins" ON saas_admins
FOR ALL USING (is_saas_admin());

-- Tenant users table policies
CREATE POLICY "SaaS admins can manage all tenant_users" ON tenant_users
FOR ALL USING (is_saas_admin());

CREATE POLICY "Users can view their own tenant memberships" ON tenant_users
FOR SELECT USING (user_id = auth.uid() OR is_saas_admin());

CREATE POLICY "Tenant admins can manage users in their tenant" ON tenant_users
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM tenant_users tu
    WHERE tu.user_id = auth.uid() 
    AND tu.tenant_id = tenant_users.tenant_id 
    AND tu.is_tenant_admin = true
  )
);

-- =====================================================
-- B10. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_profiles_tenant_id ON profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_employee_profiles_tenant_id ON employee_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_documents_tenant_id ON documents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_departments_tenant_id ON departments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_tenant_id ON evaluations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_job_listings_tenant_id ON job_listings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_tenant_id ON job_applications(tenant_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_tenant_id ON leave_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_user_id ON tenant_users(user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant_id ON tenant_users(tenant_id);