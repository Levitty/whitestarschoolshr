-- Add policy to allow anyone to view branches by tenant_id (for signup form)
CREATE POLICY "Anyone can view branches by tenant_id"
ON public.branches
FOR SELECT
USING (true);