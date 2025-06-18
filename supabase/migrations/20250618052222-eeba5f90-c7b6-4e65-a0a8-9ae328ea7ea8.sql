
-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public) VALUES ('employee-documents', 'employee-documents', false);

-- Create document categories enum
CREATE TYPE public.document_category AS ENUM (
  'employment_records',
  'disciplinary_records', 
  'performance_records',
  'leave_requests',
  'interview_records',
  'shared_documents'
);

-- Create document status enum
CREATE TYPE public.document_status AS ENUM (
  'draft',
  'pending_review',
  'approved',
  'rejected',
  'signed',
  'archived'
);

-- Create documents table
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category public.document_category NOT NULL,
  file_path TEXT,
  file_name TEXT,
  file_size INTEGER,
  file_type TEXT,
  status public.document_status DEFAULT 'draft',
  uploaded_by UUID REFERENCES public.profiles(id) NOT NULL,
  employee_id UUID REFERENCES public.profiles(id),
  is_shared BOOLEAN DEFAULT false,
  requires_signature BOOLEAN DEFAULT false,
  signed_at TIMESTAMP WITH TIME ZONE,
  signed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create leave requests table
CREATE TABLE public.leave_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.profiles(id) NOT NULL,
  leave_type TEXT NOT NULL CHECK (leave_type IN ('annual', 'sick', 'maternity', 'paternity', 'personal', 'emergency')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_requested INTEGER NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create interview records table
CREATE TABLE public.interview_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_name TEXT NOT NULL,
  candidate_email TEXT,
  position TEXT NOT NULL,
  interview_date TIMESTAMP WITH TIME ZONE NOT NULL,
  interviewer_id UUID REFERENCES public.profiles(id) NOT NULL,
  interview_type TEXT CHECK (interview_type IN ('phone', 'video', 'in-person', 'group')) DEFAULT 'in-person',
  status TEXT CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')) DEFAULT 'scheduled',
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  recommendation TEXT CHECK (recommendation IN ('hire', 'reject', 'second_interview')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create document signatures table
CREATE TABLE public.document_signatures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
  signer_id UUID REFERENCES public.profiles(id) NOT NULL,
  signature_data TEXT,
  signed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  UNIQUE(document_id, signer_id)
);

-- Enable RLS on all tables
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_signatures ENABLE ROW LEVEL SECURITY;

-- Documents policies
CREATE POLICY "Users can view their own documents" ON public.documents
  FOR SELECT USING (
    employee_id = auth.uid() OR uploaded_by = auth.uid() OR is_shared = true
  );

CREATE POLICY "Admins can view all documents" ON public.documents
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can upload documents" ON public.documents
  FOR INSERT WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Admins can manage all documents" ON public.documents
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can update their own documents" ON public.documents
  FOR UPDATE USING (uploaded_by = auth.uid());

-- Leave requests policies
CREATE POLICY "Users can view their own leave requests" ON public.leave_requests
  FOR SELECT USING (employee_id = auth.uid());

CREATE POLICY "Admins can view all leave requests" ON public.leave_requests
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can create their own leave requests" ON public.leave_requests
  FOR INSERT WITH CHECK (employee_id = auth.uid());

CREATE POLICY "Users can update their own pending leave requests" ON public.leave_requests
  FOR UPDATE USING (employee_id = auth.uid() AND status = 'pending');

CREATE POLICY "Admins can manage all leave requests" ON public.leave_requests
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Interview records policies
CREATE POLICY "Admins can manage interview records" ON public.interview_records
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Interviewers can view their own interviews" ON public.interview_records
  FOR SELECT USING (interviewer_id = auth.uid());

-- Document signatures policies
CREATE POLICY "Users can view signatures for documents they have access to" ON public.document_signatures
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.documents d 
      WHERE d.id = document_id 
      AND (d.employee_id = auth.uid() OR d.uploaded_by = auth.uid() OR d.is_shared = true)
    )
  );

CREATE POLICY "Users can sign documents" ON public.document_signatures
  FOR INSERT WITH CHECK (signer_id = auth.uid());

-- Storage policies for employee documents bucket
CREATE POLICY "Users can upload their own documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'employee-documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view documents they have access to" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'employee-documents' AND (
      auth.uid()::text = (storage.foldername(name))[1] OR
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
      ) OR
      EXISTS (
        SELECT 1 FROM public.documents d
        WHERE d.file_path = name AND d.is_shared = true
      )
    )
  );

CREATE POLICY "Admins can manage all documents in storage" ON storage.objects
  FOR ALL USING (
    bucket_id = 'employee-documents' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Add updated_at triggers
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leave_requests_updated_at
  BEFORE UPDATE ON public.leave_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_interview_records_updated_at
  BEFORE UPDATE ON public.interview_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
