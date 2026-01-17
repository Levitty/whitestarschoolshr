-- DEMO DATA FOR ENTERPRISE HR FEATURES (ENDA SPORTSWEAR)

-- Get the Enda Sportswear tenant ID
DO $$
DECLARE
  enda_tenant_id UUID;
  kevin_id UUID;
  john_id UUID;
  sarah_id UUID;
BEGIN
  -- Get Enda tenant
  SELECT id INTO enda_tenant_id FROM tenants WHERE slug = 'enda-sportswear' LIMIT 1;
  
  IF enda_tenant_id IS NOT NULL THEN
    -- Get Kevin Kamau's employee ID
    SELECT id INTO kevin_id FROM employee_profiles 
    WHERE first_name ILIKE 'Kevin' AND last_name ILIKE 'Kamau' AND tenant_id = enda_tenant_id LIMIT 1;
    
    -- Get John Doe's employee ID  
    SELECT id INTO john_id FROM employee_profiles
    WHERE first_name ILIKE 'John' AND tenant_id = enda_tenant_id LIMIT 1;
    
    -- Get Sarah's employee ID
    SELECT id INTO sarah_id FROM employee_profiles
    WHERE first_name ILIKE 'Sarah' AND tenant_id = enda_tenant_id LIMIT 1;

    -- Add sales target for Kevin if exists
    IF kevin_id IS NOT NULL THEN
      INSERT INTO employee_sales_targets (employee_id, tenant_id, monthly_target, commission_rate, current_mtd_sales)
      VALUES (kevin_id, enda_tenant_id, 1500000, 0.05, 1200000)
      ON CONFLICT (employee_id) DO UPDATE SET monthly_target = 1500000, commission_rate = 0.05;
    END IF;

    -- Create PIP for John if exists
    IF john_id IS NOT NULL THEN
      INSERT INTO performance_improvement_plans (employee_id, tenant_id, area_of_deficiency, expected_outcome, start_date, check_in_date, review_date, status)
      VALUES (john_id, enda_tenant_id, 'sales_target', 'Achieve 80% of monthly sales target consistently', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '10 days', CURRENT_DATE + INTERVAL '25 days', 'active')
      ON CONFLICT DO NOTHING;
    END IF;

    -- Update Sarah to resigned if exists
    IF sarah_id IS NOT NULL THEN
      UPDATE employee_profiles SET status = 'resigned' WHERE id = sarah_id;
    END IF;
  END IF;
END $$;