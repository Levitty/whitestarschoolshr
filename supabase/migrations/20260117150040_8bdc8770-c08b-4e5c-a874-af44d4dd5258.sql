-- Seed Enda Sportswear Demo Data

-- 1. Update existing Enda tenant or create if not exists (using red branding)
UPDATE tenants 
SET 
  primary_color = '#E31837',
  name = 'Enda Sportswear'
WHERE slug = 'enda-sportswear';

-- 2. Create corporate departments for Enda (only if they don't exist)
INSERT INTO departments (name, description, tenant_id)
SELECT 'Production', 'Manufacturing and production operations', id
FROM tenants WHERE slug = 'enda-sportswear'
ON CONFLICT DO NOTHING;

INSERT INTO departments (name, description, tenant_id)
SELECT 'Sales & Marketing', 'Sales team and marketing operations', id
FROM tenants WHERE slug = 'enda-sportswear'
ON CONFLICT DO NOTHING;

INSERT INTO departments (name, description, tenant_id)
SELECT 'Logistics', 'Supply chain and distribution', id
FROM tenants WHERE slug = 'enda-sportswear'
ON CONFLICT DO NOTHING;

INSERT INTO departments (name, description, tenant_id)
SELECT 'Finance', 'Financial operations and accounting', id
FROM tenants WHERE slug = 'enda-sportswear'
ON CONFLICT DO NOTHING;

INSERT INTO departments (name, description, tenant_id)
SELECT 'Human Resources', 'HR and employee management', id
FROM tenants WHERE slug = 'enda-sportswear'
ON CONFLICT DO NOTHING;

-- 3. Create demo employee 'Kevin Kamau' in Sales (joined 4 months ago for probation tracking)
INSERT INTO employee_profiles (
  first_name, 
  last_name, 
  email,
  phone,
  employee_number,
  position, 
  department, 
  hire_date,
  contract_start_date,
  contract_type,
  status, 
  salary,
  tenant_id
)
SELECT 
  'Kevin', 
  'Kamau',
  'kevin.kamau@endasportswear.co.ke',
  '+254712345678',
  'ENDA-001',
  'Sales Representative', 
  'Sales & Marketing',
  (CURRENT_DATE - INTERVAL '4 months')::date,
  (CURRENT_DATE - INTERVAL '4 months')::date,
  'permanent',
  'active',
  45000,
  id
FROM tenants WHERE slug = 'enda-sportswear'
ON CONFLICT DO NOTHING;

-- 4. Create another demo employee 'Sarah Wanjiku' for clearance demo
INSERT INTO employee_profiles (
  first_name, 
  last_name, 
  email,
  phone,
  employee_number,
  position, 
  department, 
  hire_date,
  contract_start_date,
  contract_type,
  status, 
  salary,
  tenant_id
)
SELECT 
  'Sarah', 
  'Wanjiku',
  'sarah.wanjiku@endasportswear.co.ke',
  '+254723456789',
  'ENDA-002',
  'Production Manager', 
  'Production',
  (CURRENT_DATE - INTERVAL '2 years')::date,
  (CURRENT_DATE - INTERVAL '2 years')::date,
  'permanent',
  'active',
  85000,
  id
FROM tenants WHERE slug = 'enda-sportswear'
ON CONFLICT DO NOTHING;

-- 5. Create a third demo employee recently hired for probation display
INSERT INTO employee_profiles (
  first_name, 
  last_name, 
  email,
  phone,
  employee_number,
  position, 
  department, 
  hire_date,
  contract_start_date,
  contract_type,
  status, 
  salary,
  tenant_id
)
SELECT 
  'James', 
  'Odhiambo',
  'james.odhiambo@endasportswear.co.ke',
  '+254734567890',
  'ENDA-003',
  'Logistics Coordinator', 
  'Logistics',
  (CURRENT_DATE - INTERVAL '2 months')::date,
  (CURRENT_DATE - INTERVAL '2 months')::date,
  'contract',
  'active',
  55000,
  id
FROM tenants WHERE slug = 'enda-sportswear'
ON CONFLICT DO NOTHING;