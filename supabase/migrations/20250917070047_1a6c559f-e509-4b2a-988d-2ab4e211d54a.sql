-- Fix RLS policy for admin evaluation creation
DROP POLICY IF EXISTS "Admins can manage all evaluations" ON public.evaluations;

CREATE POLICY "Admins can manage all evaluations"
ON public.evaluations
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND (p.role = 'admin' OR p.role = 'superadmin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND (p.role = 'admin' OR p.role = 'superadmin')
  )
);