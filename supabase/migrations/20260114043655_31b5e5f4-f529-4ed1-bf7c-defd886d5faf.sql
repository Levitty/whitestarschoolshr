-- Fix tenant data isolation by adding tenant_id filtering to RLS policies
-- This ensures each tenant only sees their own data

-- First, create a helper function to get user's tenant_id
CREATE OR REPLACE FUNCTION public.get_user_tenant_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
$$;

-- Update employee_profiles policies to include tenant filtering
DROP POLICY IF EXISTS "Users can view employee profiles" ON public.employee_profiles;
DROP POLICY IF EXISTS "Admins and superadmins can manage employee profiles" ON public.employee_profiles;

CREATE POLICY "Users can view employee profiles in their tenant"
ON public.employee_profiles
FOR SELECT
TO authenticated
USING (
  tenant_id = get_user_tenant_id()
  OR EXISTS (SELECT 1 FROM saas_admins WHERE user_id = auth.uid())
);

CREATE POLICY "Admins and superadmins can manage employee profiles in their tenant"
ON public.employee_profiles
FOR ALL
TO authenticated
USING (
  (tenant_id = get_user_tenant_id() AND get_current_user_role() IN ('admin', 'superadmin'))
  OR EXISTS (SELECT 1 FROM saas_admins WHERE user_id = auth.uid())
)
WITH CHECK (
  (tenant_id = get_user_tenant_id() AND get_current_user_role() IN ('admin', 'superadmin'))
  OR EXISTS (SELECT 1 FROM saas_admins WHERE user_id = auth.uid())
);

-- Update departments policies to include tenant filtering
DROP POLICY IF EXISTS "Anyone can view departments" ON public.departments;
DROP POLICY IF EXISTS "Admins and superadmins manage departments" ON public.departments;

CREATE POLICY "Users can view departments in their tenant"
ON public.departments
FOR SELECT
TO authenticated
USING (
  tenant_id = get_user_tenant_id()
  OR tenant_id IS NULL
  OR EXISTS (SELECT 1 FROM saas_admins WHERE user_id = auth.uid())
);

CREATE POLICY "Admins and superadmins manage departments in their tenant"
ON public.departments
FOR ALL
TO authenticated
USING (
  (tenant_id = get_user_tenant_id() AND get_current_user_role() IN ('admin', 'superadmin'))
  OR EXISTS (SELECT 1 FROM saas_admins WHERE user_id = auth.uid())
)
WITH CHECK (
  (tenant_id = get_user_tenant_id() AND get_current_user_role() IN ('admin', 'superadmin'))
  OR EXISTS (SELECT 1 FROM saas_admins WHERE user_id = auth.uid())
);

-- Update documents policies to include tenant filtering
DROP POLICY IF EXISTS "Document access policy" ON public.documents;
DROP POLICY IF EXISTS "Admins and superadmins can manage all documents" ON public.documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can upload documents" ON public.documents;

CREATE POLICY "Users can view documents in their tenant"
ON public.documents
FOR SELECT
TO authenticated
USING (
  (tenant_id = get_user_tenant_id() OR tenant_id IS NULL)
  AND (
    get_current_user_role() IN ('admin', 'superadmin')
    OR uploaded_by = auth.uid()
    OR recipient_id = auth.uid()
    OR is_shared = true
  )
  OR EXISTS (SELECT 1 FROM saas_admins WHERE user_id = auth.uid())
);

CREATE POLICY "Users can manage documents in their tenant"
ON public.documents
FOR ALL
TO authenticated
USING (
  (tenant_id = get_user_tenant_id() OR tenant_id IS NULL)
  AND (
    get_current_user_role() IN ('admin', 'superadmin')
    OR uploaded_by = auth.uid()
  )
  OR EXISTS (SELECT 1 FROM saas_admins WHERE user_id = auth.uid())
)
WITH CHECK (
  (tenant_id = get_user_tenant_id() OR tenant_id IS NULL)
  OR EXISTS (SELECT 1 FROM saas_admins WHERE user_id = auth.uid())
);

-- Update evaluations policies to include tenant filtering
DROP POLICY IF EXISTS "Admins and superadmins manage all evaluations" ON public.evaluations;
DROP POLICY IF EXISTS "Evaluators can view their evaluations" ON public.evaluations;
DROP POLICY IF EXISTS "Heads can manage department evaluations" ON public.evaluations;
DROP POLICY IF EXISTS "Staff can view own evaluations" ON public.evaluations;
DROP POLICY IF EXISTS "Superadmins can manage all evaluations" ON public.evaluations;
DROP POLICY IF EXISTS "Teachers can view own evaluations" ON public.evaluations;

CREATE POLICY "Users can view evaluations in their tenant"
ON public.evaluations
FOR SELECT
TO authenticated
USING (
  (tenant_id = get_user_tenant_id() OR tenant_id IS NULL)
  AND (
    get_current_user_role() IN ('admin', 'superadmin', 'head')
    OR evaluator_id = auth.uid()
    OR EXISTS (SELECT 1 FROM employee_profiles ep WHERE ep.id = employee_id AND ep.profile_id = auth.uid())
  )
  OR EXISTS (SELECT 1 FROM saas_admins WHERE user_id = auth.uid())
);

CREATE POLICY "Admins can manage evaluations in their tenant"
ON public.evaluations
FOR ALL
TO authenticated
USING (
  (tenant_id = get_user_tenant_id() AND get_current_user_role() IN ('admin', 'superadmin', 'head'))
  OR evaluator_id = auth.uid()
  OR EXISTS (SELECT 1 FROM saas_admins WHERE user_id = auth.uid())
)
WITH CHECK (
  (tenant_id = get_user_tenant_id() AND get_current_user_role() IN ('admin', 'superadmin', 'head'))
  OR EXISTS (SELECT 1 FROM saas_admins WHERE user_id = auth.uid())
);

-- Update job_listings policies to include tenant filtering
DROP POLICY IF EXISTS "Anyone can view open job listings" ON public.job_listings;
DROP POLICY IF EXISTS "Admins can manage job listings" ON public.job_listings;

CREATE POLICY "Anyone can view open job listings"
ON public.job_listings
FOR SELECT
USING (status = 'open');

CREATE POLICY "Admins can manage job listings in their tenant"
ON public.job_listings
FOR ALL
TO authenticated
USING (
  (tenant_id = get_user_tenant_id() AND get_current_user_role() IN ('admin', 'superadmin'))
  OR EXISTS (SELECT 1 FROM saas_admins WHERE user_id = auth.uid())
)
WITH CHECK (
  (tenant_id = get_user_tenant_id() AND get_current_user_role() IN ('admin', 'superadmin'))
  OR EXISTS (SELECT 1 FROM saas_admins WHERE user_id = auth.uid())
);

-- Update job_applications policies to include tenant filtering
DROP POLICY IF EXISTS "Admins can manage applications" ON public.job_applications;
DROP POLICY IF EXISTS "Anyone can submit applications" ON public.job_applications;

CREATE POLICY "Anyone can submit applications"
ON public.job_applications
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view applications in their tenant"
ON public.job_applications
FOR SELECT
TO authenticated
USING (
  (tenant_id = get_user_tenant_id() AND get_current_user_role() IN ('admin', 'superadmin'))
  OR EXISTS (SELECT 1 FROM saas_admins WHERE user_id = auth.uid())
);

CREATE POLICY "Admins can manage applications in their tenant"
ON public.job_applications
FOR UPDATE
TO authenticated
USING (
  (tenant_id = get_user_tenant_id() AND get_current_user_role() IN ('admin', 'superadmin'))
  OR EXISTS (SELECT 1 FROM saas_admins WHERE user_id = auth.uid())
);

-- Update leave_requests policies to include tenant filtering
DROP POLICY IF EXISTS "Users can view relevant leave requests" ON public.leave_requests;
DROP POLICY IF EXISTS "Users can manage leave requests" ON public.leave_requests;

CREATE POLICY "Users can view leave requests in their tenant"
ON public.leave_requests
FOR SELECT
TO authenticated
USING (
  (tenant_id = get_user_tenant_id() OR tenant_id IS NULL)
  AND (
    employee_id = auth.uid()
    OR get_current_user_role() IN ('admin', 'superadmin', 'head')
    OR approved_by = auth.uid()
  )
  OR EXISTS (SELECT 1 FROM saas_admins WHERE user_id = auth.uid())
);

CREATE POLICY "Users can manage leave requests in their tenant"
ON public.leave_requests
FOR ALL
TO authenticated
USING (
  (tenant_id = get_user_tenant_id() OR tenant_id IS NULL)
  AND (
    employee_id = auth.uid()
    OR get_current_user_role() IN ('admin', 'superadmin', 'head')
  )
  OR EXISTS (SELECT 1 FROM saas_admins WHERE user_id = auth.uid())
)
WITH CHECK (
  (tenant_id = get_user_tenant_id() OR tenant_id IS NULL)
  OR EXISTS (SELECT 1 FROM saas_admins WHERE user_id = auth.uid())
);