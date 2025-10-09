-- Add requirements field to job_listings table
ALTER TABLE job_listings ADD COLUMN IF NOT EXISTS requirements text;