-- Fix RLS policy for interviews table to allow admins to insert interviews
-- The current policy only has USING but not WITH CHECK, which blocks inserts

DROP POLICY IF EXISTS "Admins can manage interviews" ON public.interviews;

CREATE POLICY "Admins can manage interviews"
ON public.interviews
FOR ALL
USING (get_current_user_role() = 'admin'::text)
WITH CHECK (get_current_user_role() = 'admin'::text);