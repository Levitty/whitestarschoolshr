
-- Create job_listings table
CREATE TABLE public.job_listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  department TEXT NOT NULL,
  location TEXT NOT NULL,
  employment_type TEXT NOT NULL CHECK (employment_type IN ('Full-time', 'Part-time', 'Contract')),
  status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'Closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create job_applications table
CREATE TABLE public.job_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES public.job_listings(id) ON DELETE CASCADE,
  candidate_name TEXT NOT NULL,
  candidate_email TEXT NOT NULL,
  cv_url TEXT,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Interview', 'Rejected', 'Hired')),
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create interviews table
CREATE TABLE public.interviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES public.job_applications(id) ON DELETE CASCADE,
  interview_date TIMESTAMP WITH TIME ZONE NOT NULL,
  interviewer_name TEXT NOT NULL,
  interview_type TEXT NOT NULL CHECK (interview_type IN ('Phone', 'Physical', 'Online')),
  status TEXT NOT NULL DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Completed')),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create storage bucket for CV uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('cv-uploads', 'cv-uploads', false);

-- Enable RLS on all tables
ALTER TABLE public.job_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for job_listings
CREATE POLICY "Anyone can view open job listings" ON public.job_listings
  FOR SELECT USING (status = 'Open' OR get_current_user_role() = 'admin');

CREATE POLICY "Admins can manage job listings" ON public.job_listings
  FOR ALL USING (get_current_user_role() = 'admin');

-- RLS Policies for job_applications
CREATE POLICY "Anyone can create job applications" ON public.job_applications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all job applications" ON public.job_applications
  FOR SELECT USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins can update job applications" ON public.job_applications
  FOR UPDATE USING (get_current_user_role() = 'admin');

-- RLS Policies for interviews
CREATE POLICY "Admins can manage interviews" ON public.interviews
  FOR ALL USING (get_current_user_role() = 'admin');

-- Storage policies for CV uploads
CREATE POLICY "Anyone can upload CVs" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'cv-uploads');

CREATE POLICY "Admins can view CVs" ON storage.objects
  FOR SELECT USING (bucket_id = 'cv-uploads' AND get_current_user_role() = 'admin');

-- Add triggers for updated_at
CREATE TRIGGER update_job_listings_updated_at 
  BEFORE UPDATE ON public.job_listings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_applications_updated_at 
  BEFORE UPDATE ON public.job_applications 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interviews_updated_at 
  BEFORE UPDATE ON public.interviews 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
