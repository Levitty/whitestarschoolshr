-- Delete orphan tenant that has no users
DELETE FROM tenants 
WHERE slug = 'sample-institution' 
AND NOT EXISTS (
  SELECT 1 FROM tenant_users tu WHERE tu.tenant_id = tenants.id
);