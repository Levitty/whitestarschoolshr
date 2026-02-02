-- First, create a leave balance for Florence who doesn't have one
INSERT INTO leave_balances (employee_id, year, annual_leave_total, annual_leave_used, sick_leave_total, sick_leave_used, maternity_leave_total, maternity_leave_used, study_leave_total, study_leave_used, unpaid_leave_total, unpaid_leave_used, tenant_id)
SELECT ep.id, 2026, 21, 0, 10, 0, 60, 0, 10, 0, 30, 0, ep.tenant_id
FROM employee_profiles ep
WHERE ep.id = '4697dfc6-c1d6-461a-8653-0e2aea4030ef'
AND NOT EXISTS (SELECT 1 FROM leave_balances lb WHERE lb.employee_id = ep.id AND lb.year = 2026);

-- Update annual leave used for all employees based on approved requests
UPDATE leave_balances lb
SET annual_leave_used = COALESCE(
  (SELECT SUM(lr.days_requested) 
   FROM leave_requests lr
   JOIN employee_profiles ep ON ep.profile_id = lr.employee_id
   WHERE ep.id = lb.employee_id 
     AND lr.status = 'approved' 
     AND LOWER(lr.leave_type) = 'annual'
  ), 0)
WHERE lb.year = 2026;

-- Update sick leave used
UPDATE leave_balances lb
SET sick_leave_used = COALESCE(
  (SELECT SUM(lr.days_requested) 
   FROM leave_requests lr
   JOIN employee_profiles ep ON ep.profile_id = lr.employee_id
   WHERE ep.id = lb.employee_id 
     AND lr.status = 'approved' 
     AND LOWER(lr.leave_type) = 'sick'
  ), 0)
WHERE lb.year = 2026;

-- Update maternity leave used
UPDATE leave_balances lb
SET maternity_leave_used = COALESCE(
  (SELECT SUM(lr.days_requested) 
   FROM leave_requests lr
   JOIN employee_profiles ep ON ep.profile_id = lr.employee_id
   WHERE ep.id = lb.employee_id 
     AND lr.status = 'approved' 
     AND LOWER(lr.leave_type) = 'maternity'
  ), 0)
WHERE lb.year = 2026;

-- Update study leave used
UPDATE leave_balances lb
SET study_leave_used = COALESCE(
  (SELECT SUM(lr.days_requested) 
   FROM leave_requests lr
   JOIN employee_profiles ep ON ep.profile_id = lr.employee_id
   WHERE ep.id = lb.employee_id 
     AND lr.status = 'approved' 
     AND LOWER(lr.leave_type) = 'study'
  ), 0)
WHERE lb.year = 2026;

-- Update unpaid leave used
UPDATE leave_balances lb
SET unpaid_leave_used = COALESCE(
  (SELECT SUM(lr.days_requested) 
   FROM leave_requests lr
   JOIN employee_profiles ep ON ep.profile_id = lr.employee_id
   WHERE ep.id = lb.employee_id 
     AND lr.status = 'approved' 
     AND LOWER(lr.leave_type) = 'unpaid'
  ), 0)
WHERE lb.year = 2026;