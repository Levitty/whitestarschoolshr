
-- Create evaluations table with comprehensive structure for teacher appraisals
CREATE TABLE public.evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employee_profiles(id) ON DELETE CASCADE,
  evaluator_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  period text NOT NULL,
  type text NOT NULL DEFAULT 'Annual Review',
  branch text NOT NULL,
  overall_rating numeric(3,2) DEFAULT 0,
  
  -- Academic Achievement (20% weight)
  academic_student_performance numeric(2,1) DEFAULT 0 CHECK (academic_student_performance >= 0 AND academic_student_performance <= 5),
  academic_teaching_strategies numeric(2,1) DEFAULT 0 CHECK (academic_teaching_strategies >= 0 AND academic_teaching_strategies <= 5),
  academic_slow_learners numeric(2,1) DEFAULT 0 CHECK (academic_slow_learners >= 0 AND academic_slow_learners <= 5),
  academic_initiatives numeric(2,1) DEFAULT 0 CHECK (academic_initiatives >= 0 AND academic_initiatives <= 5),
  academic_total numeric(3,2) DEFAULT 0,
  academic_comments text,
  
  -- School Culture (20% weight)
  culture_mission_support numeric(2,1) DEFAULT 0 CHECK (culture_mission_support >= 0 AND culture_mission_support <= 5),
  culture_extracurricular numeric(2,1) DEFAULT 0 CHECK (culture_extracurricular >= 0 AND culture_extracurricular <= 5),
  culture_collaboration numeric(2,1) DEFAULT 0 CHECK (culture_collaboration >= 0 AND culture_collaboration <= 5),
  culture_diversity numeric(2,1) DEFAULT 0 CHECK (culture_diversity >= 0 AND culture_diversity <= 5),
  culture_total numeric(3,2) DEFAULT 0,
  culture_comments text,
  
  -- Teacher Professional Development (20% weight)
  development_workshops numeric(2,1) DEFAULT 0 CHECK (development_workshops >= 0 AND development_workshops <= 5),
  development_education numeric(2,1) DEFAULT 0 CHECK (development_education >= 0 AND development_education <= 5),
  development_methodologies numeric(2,1) DEFAULT 0 CHECK (development_methodologies >= 0 AND development_methodologies <= 5),
  development_mentoring numeric(2,1) DEFAULT 0 CHECK (development_mentoring >= 0 AND development_mentoring <= 5),
  development_total numeric(3,2) DEFAULT 0,
  development_comments text,
  
  -- Customer Relationship (20% weight)
  customer_responsiveness numeric(2,1) DEFAULT 0 CHECK (customer_responsiveness >= 0 AND customer_responsiveness <= 5),
  customer_communication numeric(2,1) DEFAULT 0 CHECK (customer_communication >= 0 AND customer_communication <= 5),
  customer_feedback numeric(2,1) DEFAULT 0 CHECK (customer_feedback >= 0 AND customer_feedback <= 5),
  customer_conflict_resolution numeric(2,1) DEFAULT 0 CHECK (customer_conflict_resolution >= 0 AND customer_conflict_resolution <= 5),
  customer_total numeric(3,2) DEFAULT 0,
  customer_comments text,
  
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create function to auto-calculate area totals and overall rating
CREATE OR REPLACE FUNCTION calculate_evaluation_totals()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate Academic Achievement total (average of 4 criteria)
  NEW.academic_total := (NEW.academic_student_performance + NEW.academic_teaching_strategies + 
                        NEW.academic_slow_learners + NEW.academic_initiatives) / 4.0;
  
  -- Calculate School Culture total (average of 4 criteria)
  NEW.culture_total := (NEW.culture_mission_support + NEW.culture_extracurricular + 
                       NEW.culture_collaboration + NEW.culture_diversity) / 4.0;
  
  -- Calculate Professional Development total (average of 4 criteria)
  NEW.development_total := (NEW.development_workshops + NEW.development_education + 
                           NEW.development_methodologies + NEW.development_mentoring) / 4.0;
  
  -- Calculate Customer Relationship total (average of 4 criteria)
  NEW.customer_total := (NEW.customer_responsiveness + NEW.customer_communication + 
                        NEW.customer_feedback + NEW.customer_conflict_resolution) / 4.0;
  
  -- Calculate weighted overall rating (each area is 20% = 0.2)
  NEW.overall_rating := (NEW.academic_total * 0.2) + (NEW.culture_total * 0.2) + 
                       (NEW.development_total * 0.2) + (NEW.customer_total * 0.2);
  
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-calculate totals on insert/update
CREATE TRIGGER calculate_evaluation_totals_trigger
  BEFORE INSERT OR UPDATE ON public.evaluations
  FOR EACH ROW
  EXECUTE FUNCTION calculate_evaluation_totals();

-- Enable RLS on evaluations table
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Superadmins can manage all evaluations
CREATE POLICY "Superadmins can manage all evaluations" ON public.evaluations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'superadmin' AND p.status = 'active'
    )
  );

-- RLS Policy: Heads can manage department evaluations
CREATE POLICY "Heads can manage department evaluations" ON public.evaluations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      JOIN public.employee_profiles ep ON ep.id = evaluations.employee_id
      WHERE p.id = auth.uid() AND p.role = 'head' AND p.status = 'active'
      AND p.department = ep.department
    )
  );

-- RLS Policy: Teachers can view their own evaluations
CREATE POLICY "Teachers can view own evaluations" ON public.evaluations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.employee_profiles ep 
      WHERE ep.id = evaluations.employee_id AND ep.profile_id = auth.uid()
    )
  );

-- RLS Policy: Evaluators can view evaluations they created
CREATE POLICY "Evaluators can view their evaluations" ON public.evaluations
  FOR SELECT USING (evaluator_id = auth.uid());

-- Create index for better performance
CREATE INDEX idx_evaluations_employee_id ON public.evaluations(employee_id);
CREATE INDEX idx_evaluations_evaluator_id ON public.evaluations(evaluator_id);
CREATE INDEX idx_evaluations_period ON public.evaluations(period);
