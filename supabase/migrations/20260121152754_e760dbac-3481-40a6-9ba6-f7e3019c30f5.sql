-- Fix existing pending WhiteStar users who signed up without tenant_id
-- These users signed up from hr.whitestarschools.com but didn't get the tenant_id saved
UPDATE profiles 
SET tenant_id = 'd469abc7-cf00-46b6-a5b0-540855405a50'
WHERE status = 'pending' 
AND tenant_id IS NULL
AND email IN (
  'shiprahmusembi@gmail.com',
  'winnieleah980@gmail.com',
  'nancyubwamu@gmail.com',
  'muhangiebby@gmail.com',
  'marymutheu510@gmail.com',
  'joyruth32@gmail.com'
);