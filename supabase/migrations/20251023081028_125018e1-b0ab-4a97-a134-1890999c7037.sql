-- Allow staff to view their own performance evaluations
CREATE POLICY "Staff can view own evaluations"
ON public.evaluations
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM employee_profiles ep
    WHERE ep.id = evaluations.employee_id 
    AND ep.profile_id = auth.uid()
  )
);

-- Allow staff to view their own leave balances
CREATE POLICY "Staff can view own leave balances"
ON public.leave_balances
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM employee_profiles ep
    WHERE ep.id = leave_balances.employee_id 
    AND ep.profile_id = auth.uid()
  )
);