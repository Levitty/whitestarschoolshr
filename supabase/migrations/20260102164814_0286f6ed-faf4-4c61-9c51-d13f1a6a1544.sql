-- Create letter_categories table for managing template categories
CREATE TABLE public.letter_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT 'gray',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.letter_categories ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active letter categories" 
ON public.letter_categories 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins and superadmins can manage letter categories" 
ON public.letter_categories 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['admin'::text, 'superadmin'::text]));

-- Insert default categories
INSERT INTO public.letter_categories (name, description, color) VALUES
  ('disciplinary', 'Letters related to disciplinary actions', 'red'),
  ('contractual', 'Contract-related letters and agreements', 'blue'),
  ('recognition', 'Awards, appreciation, and recognition letters', 'green'),
  ('administrative', 'General administrative correspondence', 'yellow'),
  ('performance', 'Performance reviews and feedback letters', 'purple');

-- Create trigger for updated_at
CREATE TRIGGER update_letter_categories_updated_at
  BEFORE UPDATE ON public.letter_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();