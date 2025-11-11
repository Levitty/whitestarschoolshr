-- Update documents RLS policies to work with employee_profiles.id

-- Drop existing policies that rely only on profiles
DROP POLICY IF EXISTS "Document access policy" ON documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON documents;

-- Recreate policies to check both profiles and employee_profiles
CREATE POLICY "Document access policy" ON documents
FOR SELECT
USING (
  -- Admins and superadmins can see all documents
  (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'superadmin')
  ))
  OR
  -- User uploaded the document
  (uploaded_by = auth.uid())
  OR
  -- Document is assigned to user's profile
  (employee_id = auth.uid())
  OR
  -- Document is assigned to user's employee_profile
  (EXISTS (
    SELECT 1 FROM employee_profiles
    WHERE employee_profiles.id = documents.employee_id
    AND employee_profiles.profile_id = auth.uid()
  ))
  OR
  -- Document is assigned directly to employee_profile where user matches by email
  (EXISTS (
    SELECT 1 FROM employee_profiles ep
    JOIN profiles p ON p.email = ep.email
    WHERE ep.id = documents.employee_id
    AND p.id = auth.uid()
  ))
  OR
  -- Document is shared
  (is_shared = true)
  OR
  -- Document recipient
  (recipient_id = auth.uid())
);

CREATE POLICY "Users can update their own documents" ON documents
FOR UPDATE
USING (
  uploaded_by = auth.uid()
  OR
  employee_id = auth.uid()
  OR
  (EXISTS (
    SELECT 1 FROM employee_profiles
    WHERE employee_profiles.id = documents.employee_id
    AND employee_profiles.profile_id = auth.uid()
  ))
  OR
  (EXISTS (
    SELECT 1 FROM employee_profiles ep
    JOIN profiles p ON p.email = ep.email
    WHERE ep.id = documents.employee_id
    AND p.id = auth.uid()
  ))
);
