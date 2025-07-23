
-- First, let's check the current RLS policies for evaluations
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'evaluations';

-- Update the RLS policies to properly handle superadmin role
-- Drop existing policies first
DROP POLICY IF EXISTS "Superadmins can manage all evaluations" ON public.evaluations;
DROP POLICY IF EXISTS "Heads can manage department evaluations" ON public.evaluations;
DROP POLICY IF EXISTS "Teachers can view own evaluations" ON public.evaluations;
DROP POLICY IF EXISTS "Evaluators can view their evaluations" ON public.evaluations;

-- Create a function to get the current user's role that handles superadmin
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role 
    FROM public.profiles 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create new comprehensive RLS policies for evaluations
CREATE POLICY "Superadmins can manage all evaluations" ON public.evaluations
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() 
    AND p.role = 'superadmin'
  )
);

CREATE POLICY "Heads can manage department evaluations" ON public.evaluations
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    JOIN public.employee_profiles ep ON ep.id = evaluations.employee_id
    WHERE p.id = auth.uid() 
    AND p.role = 'head' 
    AND p.department = ep.department
  )
);

CREATE POLICY "Teachers can view own evaluations" ON public.evaluations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.employee_profiles ep 
    WHERE ep.id = evaluations.employee_id 
    AND ep.profile_id = auth.uid()
  )
);

CREATE POLICY "Evaluators can view their evaluations" ON public.evaluations
FOR SELECT
USING (evaluator_id = auth.uid());
