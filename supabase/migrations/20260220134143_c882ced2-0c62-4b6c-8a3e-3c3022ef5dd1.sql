-- Fix orphaned profiles with NULL tenant_id by matching them to their leave_requests tenant
UPDATE profiles 
SET tenant_id = lr.tenant_id
FROM (
  SELECT DISTINCT employee_id, tenant_id 
  FROM leave_requests 
  WHERE tenant_id IS NOT NULL
) lr
WHERE profiles.id = lr.employee_id 
  AND profiles.tenant_id IS NULL;