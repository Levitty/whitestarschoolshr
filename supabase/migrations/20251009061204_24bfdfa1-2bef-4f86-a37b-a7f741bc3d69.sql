-- Ensure both admin and superadmin have full access to ALL tables

-- Profiles table
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;

CREATE POLICY "Admins and superadmins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (get_current_user_role() IN ('admin', 'superadmin') OR auth.uid() = id);

CREATE POLICY "Admins and superadmins can update all profiles"
ON public.profiles FOR UPDATE
TO authenticated
USING (get_current_user_role() IN ('admin', 'superadmin') OR auth.uid() = id);

CREATE POLICY "Admins and superadmins can insert profiles"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (get_current_user_role() IN ('admin', 'superadmin') OR auth.uid() = id);

-- Leave requests
DROP POLICY IF EXISTS "Admins can manage all leave requests" ON public.leave_requests;
DROP POLICY IF EXISTS "Admins can view all leave requests" ON public.leave_requests;

CREATE POLICY "Admins and superadmins manage all leave requests"
ON public.leave_requests FOR ALL
TO authenticated
USING (get_current_user_role() IN ('admin', 'superadmin'))
WITH CHECK (get_current_user_role() IN ('admin', 'superadmin'));

-- Documents
DROP POLICY IF EXISTS "Admins can manage all documents" ON public.documents;

CREATE POLICY "Admins and superadmins can manage all documents"
ON public.documents FOR ALL
TO authenticated
USING (get_current_user_role() IN ('admin', 'superadmin') OR uploaded_by = auth.uid() OR employee_id = auth.uid() OR recipient_id = auth.uid() OR is_shared = true);

-- Evaluations
DROP POLICY IF EXISTS "Admins can manage all evaluations" ON public.evaluations;

CREATE POLICY "Admins and superadmins manage all evaluations"
ON public.evaluations FOR ALL
TO authenticated
USING (
  get_current_user_role() IN ('admin', 'superadmin')
  OR evaluator_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM employee_profiles ep
    WHERE ep.id = evaluations.employee_id AND ep.profile_id = auth.uid()
  )
)
WITH CHECK (get_current_user_role() IN ('admin', 'superadmin'));

-- Interview records
DROP POLICY IF EXISTS "Admins can manage interview records" ON public.interview_records;

CREATE POLICY "Admins and superadmins manage interview records"
ON public.interview_records FOR ALL
TO authenticated
USING (get_current_user_role() IN ('admin', 'superadmin') OR interviewer_id = auth.uid());

-- Job applications
DROP POLICY IF EXISTS "Admins can update job applications" ON public.job_applications;
DROP POLICY IF EXISTS "Admins can view job applications" ON public.job_applications;

CREATE POLICY "Admins and superadmins manage job applications"
ON public.job_applications FOR ALL
TO authenticated
USING (get_current_user_role() IN ('admin', 'superadmin'));

-- Recruitment assessments
DROP POLICY IF EXISTS "Admins can manage all assessments" ON public.recruitment_assessments;

CREATE POLICY "Admins and superadmins manage all assessments"
ON public.recruitment_assessments FOR ALL
TO authenticated
USING (get_current_user_role() IN ('admin', 'superadmin') OR candidate_email IN (SELECT email FROM profiles WHERE id = auth.uid()));

-- Document templates
DROP POLICY IF EXISTS "Admins can manage document templates" ON public.document_templates;

CREATE POLICY "Admins and superadmins manage document templates"
ON public.document_templates FOR ALL
TO authenticated
USING (get_current_user_role() IN ('admin', 'superadmin'));

-- Letter templates
DROP POLICY IF EXISTS "Admins can manage letter templates" ON public.letter_templates;

CREATE POLICY "Admins and superadmins manage letter templates"
ON public.letter_templates FOR ALL
TO authenticated
USING (get_current_user_role() IN ('admin', 'superadmin'));

-- Letterhead settings
DROP POLICY IF EXISTS "Admins can manage letterhead settings" ON public.letterhead_settings;

CREATE POLICY "Admins and superadmins manage letterhead settings"
ON public.letterhead_settings FOR ALL
TO authenticated
USING (get_current_user_role() IN ('admin', 'superadmin'));

-- Departments
DROP POLICY IF EXISTS "Admins can manage departments" ON public.departments;

CREATE POLICY "Admins and superadmins manage departments"
ON public.departments FOR ALL
TO authenticated
USING (get_current_user_role() IN ('admin', 'superadmin'));

-- Employees
DROP POLICY IF EXISTS "Admins can manage employee records" ON public.employees;
DROP POLICY IF EXISTS "Admins can view all employee records" ON public.employees;

CREATE POLICY "Admins and superadmins manage employee records"
ON public.employees FOR ALL
TO authenticated
USING (get_current_user_role() IN ('admin', 'superadmin') OR profile_id = auth.uid());