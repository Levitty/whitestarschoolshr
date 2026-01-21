-- Fix Ruth Joy's tenant_id - she was approved but tenant_id is NULL
UPDATE profiles 
SET tenant_id = 'd469abc7-cf00-46b6-a5b0-540855405a50'
WHERE email = 'joyruth32@gmail.com' AND tenant_id IS NULL;

-- Also check and fix any other approved WhiteStar users with missing tenant_id
UPDATE profiles 
SET tenant_id = 'd469abc7-cf00-46b6-a5b0-540855405a50'
WHERE status = 'active' 
  AND tenant_id IS NULL 
  AND id IN (
    SELECT id FROM profiles 
    WHERE created_at >= '2026-01-21'
    AND email NOT IN ('mutualevy@gmail.com')
  );

-- Add RLS policy for SaaS admins to delete tenants
DROP POLICY IF EXISTS "SaaS admins can delete tenants" ON tenants;
CREATE POLICY "SaaS admins can delete tenants"
ON tenants FOR DELETE
USING (is_saas_admin());