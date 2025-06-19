
-- Add admin-specific document types and enhance existing tables
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS recipient_id UUID REFERENCES public.profiles(id);
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS is_system_generated BOOLEAN DEFAULT false;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS template_type TEXT;

-- Create recruitment assessments table
CREATE TABLE public.recruitment_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_name TEXT NOT NULL,
  candidate_email TEXT NOT NULL,
  position TEXT NOT NULL,
  assessment_type TEXT CHECK (assessment_type IN ('technical', 'behavioral', 'aptitude', 'combined')) NOT NULL,
  questions JSONB DEFAULT '[]'::jsonb,
  answers JSONB DEFAULT '[]'::jsonb,
  score INTEGER,
  max_score INTEGER,
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'evaluated')) DEFAULT 'pending',
  time_limit INTEGER, -- in minutes
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  evaluated_by UUID REFERENCES public.profiles(id),
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create document templates table for HR letters
CREATE TABLE public.document_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  template_type TEXT CHECK (template_type IN ('disciplinary', 'warning', 'termination', 'promotion', 'general')) NOT NULL,
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb, -- Variables that can be replaced like {employee_name}, {date}
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table for document sharing
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('document', 'leave', 'interview', 'general')) NOT NULL,
  is_read BOOLEAN DEFAULT false,
  related_id UUID, -- Can reference documents, leave_requests, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE public.recruitment_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for recruitment_assessments
CREATE POLICY "Admins can manage all assessments" ON public.recruitment_assessments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can view assessments assigned to them" ON public.recruitment_assessments
  FOR SELECT USING (
    candidate_email IN (SELECT email FROM public.profiles WHERE id = auth.uid())
  );

-- RLS Policies for document_templates
CREATE POLICY "Admins can manage document templates" ON public.document_templates
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Update existing document policies for admin access
DROP POLICY IF EXISTS "Users can view their own documents" ON public.documents;
DROP POLICY IF EXISTS "Admins can view all documents" ON public.documents;

CREATE POLICY "Document access policy" ON public.documents
  FOR SELECT USING (
    -- Admins can see everything
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') OR
    -- Users can see their own documents
    employee_id = auth.uid() OR uploaded_by = auth.uid() OR
    -- Users can see documents shared with them
    recipient_id = auth.uid() OR
    -- Users can see shared documents
    is_shared = true
  );

-- Update triggers
CREATE TRIGGER update_recruitment_assessments_updated_at
  BEFORE UPDATE ON public.recruitment_assessments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_document_templates_updated_at
  BEFORE UPDATE ON public.document_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
