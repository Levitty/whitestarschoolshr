-- Fix job_listings RLS policies for tenant isolation
DROP POLICY IF EXISTS "Job listings are viewable by everyone" ON public.job_listings;
DROP POLICY IF EXISTS "Admins can manage job listings" ON public.job_listings;
DROP POLICY IF EXISTS "Authenticated users can view job listings" ON public.job_listings;
DROP POLICY IF EXISTS "Admins can create job listings" ON public.job_listings;
DROP POLICY IF EXISTS "Admins can update job listings" ON public.job_listings;
DROP POLICY IF EXISTS "Admins can delete job listings" ON public.job_listings;

-- Job listings: viewable by tenant members, public job board for open jobs
CREATE POLICY "Users can view job listings in their tenant"
ON public.job_listings FOR SELECT
USING (
  tenant_id = public.get_user_tenant_id() OR 
  public.is_saas_admin() OR
  (status = 'Open' AND tenant_id IS NOT NULL) -- Public can see open jobs
);

CREATE POLICY "Admins can insert job listings"
ON public.job_listings FOR INSERT
WITH CHECK (
  (tenant_id = public.get_user_tenant_id() AND (
    public.has_role(auth.uid(), 'superadmin') OR 
    public.has_role(auth.uid(), 'admin')
  )) OR public.is_saas_admin()
);

CREATE POLICY "Admins can update job listings"
ON public.job_listings FOR UPDATE
USING (
  (tenant_id = public.get_user_tenant_id() AND (
    public.has_role(auth.uid(), 'superadmin') OR 
    public.has_role(auth.uid(), 'admin')
  )) OR public.is_saas_admin()
);

CREATE POLICY "Admins can delete job listings"
ON public.job_listings FOR DELETE
USING (
  (tenant_id = public.get_user_tenant_id() AND (
    public.has_role(auth.uid(), 'superadmin') OR 
    public.has_role(auth.uid(), 'admin')
  )) OR public.is_saas_admin()
);

-- Fix job_applications RLS policies for tenant isolation
DROP POLICY IF EXISTS "Job applications are viewable by admins" ON public.job_applications;
DROP POLICY IF EXISTS "Anyone can create applications" ON public.job_applications;
DROP POLICY IF EXISTS "Admins can update applications" ON public.job_applications;
DROP POLICY IF EXISTS "Admins can delete applications" ON public.job_applications;
DROP POLICY IF EXISTS "Anyone can submit applications" ON public.job_applications;
DROP POLICY IF EXISTS "Admins can manage applications" ON public.job_applications;

-- Job applications: viewable by tenant admins only
CREATE POLICY "Users can view applications in their tenant"
ON public.job_applications FOR SELECT
USING (
  tenant_id = public.get_user_tenant_id() OR 
  public.is_saas_admin()
);

-- Anyone can apply (public job applications)
CREATE POLICY "Anyone can submit applications"
ON public.job_applications FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can update applications"
ON public.job_applications FOR UPDATE
USING (
  (tenant_id = public.get_user_tenant_id() AND (
    public.has_role(auth.uid(), 'superadmin') OR 
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'head')
  )) OR public.is_saas_admin()
);

CREATE POLICY "Admins can delete applications"
ON public.job_applications FOR DELETE
USING (
  (tenant_id = public.get_user_tenant_id() AND (
    public.has_role(auth.uid(), 'superadmin') OR 
    public.has_role(auth.uid(), 'admin')
  )) OR public.is_saas_admin()
);

-- Fix interviews RLS policies for tenant isolation
DROP POLICY IF EXISTS "Interviews are viewable by admins" ON public.interviews;
DROP POLICY IF EXISTS "Admins can manage interviews" ON public.interviews;
DROP POLICY IF EXISTS "Admins can create interviews" ON public.interviews;
DROP POLICY IF EXISTS "Admins can update interviews" ON public.interviews;
DROP POLICY IF EXISTS "Admins can delete interviews" ON public.interviews;

CREATE POLICY "Users can view interviews in their tenant"
ON public.interviews FOR SELECT
USING (
  tenant_id = public.get_user_tenant_id() OR 
  public.is_saas_admin()
);

CREATE POLICY "Admins can insert interviews"
ON public.interviews FOR INSERT
WITH CHECK (
  (tenant_id = public.get_user_tenant_id() AND (
    public.has_role(auth.uid(), 'superadmin') OR 
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'head')
  )) OR public.is_saas_admin()
);

CREATE POLICY "Admins can update interviews"
ON public.interviews FOR UPDATE
USING (
  (tenant_id = public.get_user_tenant_id() AND (
    public.has_role(auth.uid(), 'superadmin') OR 
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'head')
  )) OR public.is_saas_admin()
);

CREATE POLICY "Admins can delete interviews"
ON public.interviews FOR DELETE
USING (
  (tenant_id = public.get_user_tenant_id() AND (
    public.has_role(auth.uid(), 'superadmin') OR 
    public.has_role(auth.uid(), 'admin')
  )) OR public.is_saas_admin()
);