-- Create employee profile for hr@whitestarschools.com using a unique employee number
INSERT INTO public.employee_profiles (
  first_name, last_name, email, department, position, hire_date, status, tenant_id, profile_id, employee_number
)
VALUES (
  'Hr', '', 'hr@whitestarschools.com', 'Culinary', 'Support Staff', CURRENT_DATE, 'active', 
  'd469abc7-cf00-46b6-a5b0-540855405a50', '6ff24fdc-12fa-4194-83cd-62e449b16662',
  'EMP' || LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(employee_number FROM 4) AS INTEGER)), 0) + 1 FROM employee_profiles WHERE employee_number LIKE 'EMP%')::text, 4, '0')
);