
-- Allow admins to insert leave_requests (for bulk grant)
CREATE POLICY "Admins can insert leave requests in their tenant"
ON public.leave_requests
FOR INSERT
TO authenticated
WITH CHECK (
  (tenant_id = get_user_tenant_id()) 
  AND (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text, 'head'::text]))
);

-- Allow admins to update leave_requests in their tenant
CREATE POLICY "Admins can update leave requests in their tenant"
ON public.leave_requests
FOR UPDATE
TO authenticated
USING (
  (tenant_id = get_user_tenant_id()) 
  AND (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text, 'head'::text]))
);

-- Allow admins to view all leave_requests in their tenant
CREATE POLICY "Admins can view leave requests in their tenant"
ON public.leave_requests
FOR SELECT
TO authenticated
USING (
  (tenant_id = get_user_tenant_id()) 
  OR (EXISTS (SELECT 1 FROM saas_admins WHERE saas_admins.user_id = auth.uid()))
);

-- Allow staff to insert their own leave requests
CREATE POLICY "Staff can insert own leave requests"
ON public.leave_requests
FOR INSERT
TO authenticated
WITH CHECK (
  employee_id = auth.uid() AND tenant_id = get_user_tenant_id()
);

-- Allow staff to view their own leave requests
CREATE POLICY "Staff can view own leave requests"
ON public.leave_requests
FOR SELECT
TO authenticated
USING (
  employee_id = auth.uid()
);

-- Allow admins to manage leave_balances (currently only superadmin can)
CREATE POLICY "Admins can manage leave balances in their tenant"
ON public.leave_balances
FOR ALL
TO authenticated
USING (
  (tenant_id = get_user_tenant_id()) 
  AND (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text]))
)
WITH CHECK (
  (tenant_id = get_user_tenant_id()) 
  AND (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text]))
);

-- Allow admins to delete leave requests
CREATE POLICY "Admins can delete leave requests in their tenant"
ON public.leave_requests
FOR DELETE
TO authenticated
USING (
  (tenant_id = get_user_tenant_id()) 
  AND (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text]))
);
