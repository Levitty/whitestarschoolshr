-- Add tenant_type column with default 'school'
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS tenant_type TEXT CHECK (tenant_type IN ('school', 'corporate')) DEFAULT 'school';

-- Add features column with default empty JSON
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '{}'::jsonb;

-- Update the demo tenant 'enda-sportswear' to be corporate
UPDATE public.tenants 
SET 
  tenant_type = 'corporate',
  features = '{
    "salesCommission": true,
    "compensationStructure": true,
    "probationTracker": true,
    "workforceDistribution": true,
    "departmentClearance": true
  }'::jsonb
WHERE slug = 'enda-sportswear';
