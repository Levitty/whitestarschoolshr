-- Add RLS policy to allow anonymous users to view departments by tenant_id
-- This is needed for the signup page where users select their department
CREATE POLICY "Anyone can view departments by tenant_id" 
ON public.departments 
FOR SELECT 
USING (true);