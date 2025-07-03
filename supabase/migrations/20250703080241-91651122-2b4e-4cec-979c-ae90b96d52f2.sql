
-- Create employees table with detailed fields
CREATE TABLE public.employee_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  employee_number TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  address TEXT,
  position TEXT NOT NULL,
  department TEXT NOT NULL,
  hire_date DATE NOT NULL,
  salary DECIMAL(10,2),
  contract_type TEXT DEFAULT 'full-time',
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,
  status TEXT DEFAULT 'active',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create leave balance table
CREATE TABLE public.leave_balances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.employee_profiles(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  annual_leave_total INTEGER DEFAULT 21,
  annual_leave_used INTEGER DEFAULT 0,
  sick_leave_total INTEGER DEFAULT 10,
  sick_leave_used INTEGER DEFAULT 0,
  personal_leave_total INTEGER DEFAULT 5,
  personal_leave_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(employee_id, year)
);

-- Create tickets/complaints table
CREATE TABLE public.tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.employee_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'open',
  assigned_to UUID REFERENCES public.employee_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create weekly reports table
CREATE TABLE public.weekly_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.employee_profiles(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  accomplishments TEXT NOT NULL,
  challenges TEXT,
  next_week_goals TEXT,
  hours_worked INTEGER,
  status TEXT DEFAULT 'draft',
  submitted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(employee_id, week_start_date)
);

-- Create document sharing table
CREATE TABLE public.document_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  shared_by UUID REFERENCES public.employee_profiles(id) ON DELETE CASCADE,
  shared_with UUID REFERENCES public.employee_profiles(id) ON DELETE CASCADE,
  permission_type TEXT DEFAULT 'view',
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.employee_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_shares ENABLE ROW LEVEL SECURITY;

-- RLS Policies for employee_profiles
CREATE POLICY "Anyone can view employee profiles" ON public.employee_profiles FOR SELECT USING (true);
CREATE POLICY "Anyone can create employee profiles" ON public.employee_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update employee profiles" ON public.employee_profiles FOR UPDATE USING (true);

-- RLS Policies for leave_balances
CREATE POLICY "Employees can view all leave balances" ON public.leave_balances FOR SELECT USING (true);
CREATE POLICY "Anyone can manage leave balances" ON public.leave_balances FOR ALL USING (true);

-- RLS Policies for tickets
CREATE POLICY "Employees can view all tickets" ON public.tickets FOR SELECT USING (true);
CREATE POLICY "Employees can create tickets" ON public.tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update tickets" ON public.tickets FOR UPDATE USING (true);

-- RLS Policies for weekly_reports
CREATE POLICY "Employees can view all reports" ON public.weekly_reports FOR SELECT USING (true);
CREATE POLICY "Employees can create their own reports" ON public.weekly_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Employees can update their own reports" ON public.weekly_reports FOR UPDATE USING (true);

-- RLS Policies for document_shares
CREATE POLICY "Users can view document shares" ON public.document_shares FOR SELECT USING (true);
CREATE POLICY "Users can create document shares" ON public.document_shares FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can manage document shares" ON public.document_shares FOR UPDATE USING (true);

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_employee_profiles_updated_at BEFORE UPDATE ON public.employee_profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_leave_balances_updated_at BEFORE UPDATE ON public.leave_balances FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON public.tickets FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_weekly_reports_updated_at BEFORE UPDATE ON public.weekly_reports FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
