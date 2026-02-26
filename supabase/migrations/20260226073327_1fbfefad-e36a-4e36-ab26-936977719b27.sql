-- Backfill tenant_id for all pending profiles that are missing it
-- These are Google SSO users who signed up via hr.whitestarschools.com
UPDATE public.profiles 
SET tenant_id = 'd469abc7-cf00-46b6-a5b0-540855405a50' 
WHERE tenant_id IS NULL 
AND status = 'pending';