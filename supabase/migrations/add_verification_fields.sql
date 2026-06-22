-- Add verification fields to profiles table

-- Create enum for verification status
CREATE TYPE verification_status_enum AS ENUM ('unverified', 'pending', 'verified', 'rejected');

-- Add columns to profiles table
ALTER TABLE public.profiles
  ADD COLUMN verification_status verification_status_enum DEFAULT 'unverified' NOT NULL,
  ADD COLUMN verification_document_url TEXT,
  ADD COLUMN verification_submitted_at TIMESTAMPTZ,
  ADD COLUMN verification_verified_at TIMESTAMPTZ,
  ADD COLUMN verification_rejected_reason TEXT,
  ADD COLUMN building_id UUID REFERENCES public.houses(id) ON DELETE SET NULL;

-- Create index for faster queries
CREATE INDEX idx_profiles_verification_status ON public.profiles(verification_status);
CREATE INDEX idx_profiles_building_id ON public.profiles(building_id);

-- Add comment
COMMENT ON COLUMN public.profiles.verification_status IS 'User verification status: unverified (default), pending (submitted document), verified (approved), rejected (denied)';
COMMENT ON COLUMN public.profiles.verification_document_url IS 'URL to uploaded utility bill or residence document in Supabase Storage';
COMMENT ON COLUMN public.profiles.building_id IS 'Reference to the house/building user belongs to';
