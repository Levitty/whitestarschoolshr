-- Broaden interviews RLS to include superadmins as well as admins
DROP POLICY IF EXISTS "Admins can manage interviews" ON public.interviews;
DROP POLICY IF EXISTS "Admins and superadmins can manage interviews" ON public.interviews;

CREATE POLICY "Admins and superadmins can manage interviews"
ON public.interviews
FOR ALL
USING (get_current_user_role() IN ('admin', 'superadmin'))
WITH CHECK (get_current_user_role() IN ('admin', 'superadmin'));
