-- Add workflow columns to leave_requests table
ALTER TABLE public.leave_requests 
ADD COLUMN IF NOT EXISTS workflow_stage TEXT DEFAULT 'pending_head',
ADD COLUMN IF NOT EXISTS head_reviewed_by UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS head_reviewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS head_recommendation TEXT,
ADD COLUMN IF NOT EXISTS head_internal_notes TEXT;

-- Add constraint for workflow_stage values
ALTER TABLE public.leave_requests 
ADD CONSTRAINT leave_requests_workflow_stage_check 
CHECK (workflow_stage IN ('pending_head', 'pending_hr', 'approved', 'rejected'));

-- Add constraint for head_recommendation values
ALTER TABLE public.leave_requests 
ADD CONSTRAINT leave_requests_head_recommendation_check 
CHECK (head_recommendation IS NULL OR head_recommendation IN ('recommend_approve', 'recommend_reject', 'neutral'));

-- Create index for workflow stage queries
CREATE INDEX IF NOT EXISTS idx_leave_requests_workflow_stage ON public.leave_requests(workflow_stage);

-- Create a function to get leave requests with role-based field filtering
CREATE OR REPLACE FUNCTION public.get_leave_requests_for_role()
RETURNS SETOF leave_requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role app_role;
BEGIN
  -- Get user's role
  SELECT role INTO user_role FROM user_roles WHERE user_id = auth.uid() LIMIT 1;
  
  -- Return all fields for head, admin, superadmin
  IF user_role IN ('head', 'admin', 'superadmin') THEN
    RETURN QUERY SELECT * FROM leave_requests ORDER BY created_at DESC;
  ELSE
    -- For regular employees, return their own requests without internal notes
    RETURN QUERY 
    SELECT 
      id, employee_id, leave_type, start_date, end_date, days_requested,
      reason, status, approved_by, approved_at, comments, created_at, updated_at,
      tenant_id, decision_at, workflow_stage, head_reviewed_by, head_reviewed_at,
      NULL::TEXT as head_recommendation,
      NULL::TEXT as head_internal_notes
    FROM leave_requests 
    WHERE employee_id = auth.uid()
    ORDER BY created_at DESC;
  END IF;
END;
$$;