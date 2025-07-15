
-- Update the job listings RLS policies to handle both admin and superadmin roles
DROP POLICY IF EXISTS "Admins can manage job listings" ON public.job_listings;
DROP POLICY IF EXISTS "Anyone can view open job listings" ON public.job_listings;

-- Create new policies that properly handle superadmin role
CREATE POLICY "Admins and superadmins can manage job listings" ON public.job_listings
FOR ALL
USING (
  get_current_user_role() = 'admin' OR 
  get_current_user_role() = 'superadmin'
);

CREATE POLICY "Anyone can view open job listings" ON public.job_listings
FOR SELECT
USING (
  status = 'Open' OR 
  get_current_user_role() = 'admin' OR 
  get_current_user_role() = 'superadmin'
);
