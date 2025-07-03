
-- Add contract expiry fields to employee_profiles table
ALTER TABLE public.employee_profiles 
ADD COLUMN contract_start_date DATE,
ADD COLUMN contract_end_date DATE,
ADD COLUMN contract_duration_months INTEGER DEFAULT 12,
ADD COLUMN contract_reminder_sent BOOLEAN DEFAULT false;

-- Create contract reminders table
CREATE TABLE public.contract_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.employee_profiles(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL, -- '3_month', '1_month', '1_week'
  reminder_date DATE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on contract_reminders
ALTER TABLE public.contract_reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policy for contract_reminders
CREATE POLICY "Anyone can manage contract reminders" ON public.contract_reminders FOR ALL USING (true);

-- Function to check for expiring contracts
CREATE OR REPLACE FUNCTION check_expiring_contracts()
RETURNS TABLE (
  employee_id UUID,
  employee_name TEXT,
  contract_end_date DATE,
  days_until_expiry INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ep.id,
    CONCAT(ep.first_name, ' ', ep.last_name),
    ep.contract_end_date,
    (ep.contract_end_date - CURRENT_DATE)::INTEGER
  FROM employee_profiles ep
  WHERE ep.contract_end_date IS NOT NULL
    AND ep.contract_end_date <= CURRENT_DATE + INTERVAL '90 days'
    AND ep.status = 'active'
  ORDER BY ep.contract_end_date ASC;
END;
$$ LANGUAGE plpgsql;
