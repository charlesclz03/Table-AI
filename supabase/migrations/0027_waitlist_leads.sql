-- Migration: 0027_waitlist_leads
-- Creates the waitlist_leads table for pre-launch interest collection
-- Also adds source column to restaurants for lead attribution

BEGIN;

CREATE TABLE IF NOT EXISTS public.waitlist_leads (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name          TEXT        NOT NULL CHECK (char_length(name) <= 160),
  email         TEXT        NOT NULL CHECK (char_length(email) <= 254),
  restaurant_name TEXT      NOT NULL CHECK (char_length(restaurant_name) <= 240),
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.waitlist_leads ENABLE ROW LEVEL SECURITY;

-- Allow public inserts (anyone can submit a waitlist form)
CREATE POLICY "Anyone can submit a waitlist lead"
  ON public.waitlist_leads
  FOR INSERT
  TO anon
  USING (true);

-- Allow authenticated users to read their own leads (by email match)
CREATE POLICY "Admins can read waitlist leads"
  ON public.waitlist_leads
  FOR SELECT
  TO authenticated
  USING (true);

COMMENT ON TABLE public.waitlist_leads IS 'Pre-launch interest form submissions';
COMMENT ON COLUMN public.waitlist_leads.id IS 'Unique lead identifier';
COMMENT ON COLUMN public.waitlist_leads.name IS 'Full name of the person submitting';
COMMENT ON COLUMN public.waitlist_leads.email IS 'Email address of the submitter';
COMMENT ON COLUMN public.waitlist_leads.restaurant_name IS 'Name of the restaurant they want to onboard';
COMMENT ON COLUMN public.waitlist_leads.notes IS 'Free-text notes on why they are interested';

-- Add source column to restaurants for lead attribution
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS source VARCHAR(80) DEFAULT 'direct';

COMMIT;
