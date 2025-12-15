-- Add employment details fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS id_number text,
ADD COLUMN IF NOT EXISTS kra_pin text,
ADD COLUMN IF NOT EXISTS birth_date date,
ADD COLUMN IF NOT EXISTS gender text,
ADD COLUMN IF NOT EXISTS sha_number text,
ADD COLUMN IF NOT EXISTS nssf_number text,
ADD COLUMN IF NOT EXISTS tsc_number text,
ADD COLUMN IF NOT EXISTS next_of_kin_name text,
ADD COLUMN IF NOT EXISTS next_of_kin_phone text,
ADD COLUMN IF NOT EXISTS next_of_kin_relationship text,
ADD COLUMN IF NOT EXISTS physical_address text,
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;

-- Update existing users to have onboarding_completed = true (assuming they're already set up)
UPDATE public.profiles SET onboarding_completed = true WHERE status = 'active';