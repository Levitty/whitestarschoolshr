-- Add new leave type columns to leave_balances table
ALTER TABLE public.leave_balances
ADD COLUMN IF NOT EXISTS maternity_leave_total integer DEFAULT 90,
ADD COLUMN IF NOT EXISTS maternity_leave_used integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS study_leave_total integer DEFAULT 10,
ADD COLUMN IF NOT EXISTS study_leave_used integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS unpaid_leave_total integer DEFAULT 30,
ADD COLUMN IF NOT EXISTS unpaid_leave_used integer DEFAULT 0;

-- Rename personal_leave columns to match (we'll keep them for backward compatibility but won't use them)
-- Drop personal leave columns since they're no longer needed
ALTER TABLE public.leave_balances
DROP COLUMN IF EXISTS personal_leave_total,
DROP COLUMN IF EXISTS personal_leave_used;

-- Create a global leave settings table for admin to set default balances
CREATE TABLE IF NOT EXISTS public.leave_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year integer NOT NULL UNIQUE,
  annual_leave_total integer DEFAULT 21,
  sick_leave_total integer DEFAULT 10,
  maternity_leave_total integer DEFAULT 90,
  study_leave_total integer DEFAULT 10,
  unpaid_leave_total integer DEFAULT 30,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on leave_settings
ALTER TABLE public.leave_settings ENABLE ROW LEVEL SECURITY;

-- Allow admins and superadmins to manage leave settings
CREATE POLICY "Admins and superadmins can manage leave settings"
ON public.leave_settings
FOR ALL
USING (get_current_user_role() IN ('admin', 'superadmin'))
WITH CHECK (get_current_user_role() IN ('admin', 'superadmin'));

-- Allow all authenticated users to view leave settings
CREATE POLICY "Users can view leave settings"
ON public.leave_settings
FOR SELECT
USING (true);