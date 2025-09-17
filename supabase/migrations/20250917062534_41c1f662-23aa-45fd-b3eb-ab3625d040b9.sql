-- Create departments table
CREATE TABLE public.departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on departments
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- Create policies for departments
CREATE POLICY "Anyone can view departments" 
ON public.departments 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage departments" 
ON public.departments 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role IN ('admin', 'superadmin')
));

-- Insert default departments
INSERT INTO public.departments (name, description) VALUES
  ('Engineering', 'Software development and technical operations'),
  ('Product', 'Product management and strategy'),
  ('Design', 'User experience and visual design'),
  ('Analytics', 'Data analysis and business intelligence'),
  ('Marketing', 'Marketing and brand management'),
  ('Sales', 'Sales and business development'),
  ('HR', 'Human resources and talent management'),
  ('Finance', 'Financial operations and accounting'),
  ('Mathematics', 'Mathematics education department'),
  ('Science', 'Science education department'),
  ('English', 'English and literature department'),
  ('History', 'History and social studies department'),
  ('Administration', 'School administration and operations');

-- Ensure employee number sequence exists
CREATE SEQUENCE IF NOT EXISTS employee_number_seq START WITH 1;

-- Update the employee number generation trigger to work on employee_profiles
DROP TRIGGER IF EXISTS generate_employee_number_trigger ON employee_profiles;

CREATE TRIGGER generate_employee_number_trigger
  BEFORE INSERT ON employee_profiles
  FOR EACH ROW
  WHEN (NEW.employee_number IS NULL OR NEW.employee_number = '')
  EXECUTE FUNCTION generate_employee_number();

-- Add updated_at trigger for departments
CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();