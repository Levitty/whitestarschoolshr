
-- Create letter_templates table
CREATE TABLE public.letter_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('disciplinary', 'contractual', 'recognition', 'administrative', 'performance')),
  body TEXT NOT NULL,
  placeholders JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create letterhead_settings table for branded headers
CREATE TABLE public.letterhead_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT,
  logo_url TEXT,
  header_image_url TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add letter-specific columns to existing documents table
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS letter_type TEXT,
ADD COLUMN IF NOT EXISTS source TEXT CHECK (source IN ('manual', 'ai_generated', 'template')),
ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES letter_templates(id),
ADD COLUMN IF NOT EXISTS letter_content TEXT;

-- Enable RLS on new tables
ALTER TABLE public.letter_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.letterhead_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for letter_templates
CREATE POLICY "Admins can manage letter templates" 
  ON public.letter_templates 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  ));

CREATE POLICY "Users can view active letter templates" 
  ON public.letter_templates 
  FOR SELECT 
  USING (is_active = true);

-- RLS policies for letterhead_settings
CREATE POLICY "Admins can manage letterhead settings" 
  ON public.letterhead_settings 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  ));

CREATE POLICY "Users can view active letterhead settings" 
  ON public.letterhead_settings 
  FOR SELECT 
  USING (is_active = true);

-- Create storage bucket for letterhead images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('letterhead-images', 'letterhead-images', true);

-- Storage policies for letterhead images
CREATE POLICY "Admins can upload letterhead images" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'letterhead-images' 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Anyone can view letterhead images" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'letterhead-images');

-- Update trigger for letter_templates
CREATE OR REPLACE FUNCTION update_letter_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_letter_templates_updated_at
  BEFORE UPDATE ON letter_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_letter_templates_updated_at();

-- Update trigger for letterhead_settings
CREATE TRIGGER update_letterhead_settings_updated_at
  BEFORE UPDATE ON letterhead_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
