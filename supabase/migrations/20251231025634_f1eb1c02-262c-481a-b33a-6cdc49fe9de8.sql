-- Add branch column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS branch text;

-- Add deputy_head to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'deputy_head';