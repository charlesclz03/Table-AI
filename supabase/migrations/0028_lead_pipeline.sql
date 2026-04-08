-- Migration: 0028_lead_pipeline
-- Adds CRM-style pipeline fields to waitlist leads so admin can track
-- acquisition source, sales progress, and real conversions.

BEGIN;

ALTER TABLE public.waitlist_leads
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'waitlist',
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS last_contacted_at timestamptz,
  ADD COLUMN IF NOT EXISTS converted_at timestamptz,
  ADD COLUMN IF NOT EXISTS converted_restaurant_id uuid REFERENCES public.restaurants (id) ON DELETE SET NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'waitlist_leads_status_check'
  ) THEN
    ALTER TABLE public.waitlist_leads
      ADD CONSTRAINT waitlist_leads_status_check
      CHECK (status IN ('new', 'contacted', 'qualified', 'converted'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS waitlist_leads_status_idx
  ON public.waitlist_leads (status);

CREATE INDEX IF NOT EXISTS waitlist_leads_email_idx
  ON public.waitlist_leads (lower(email));

UPDATE public.waitlist_leads
SET
  source = COALESCE(NULLIF(source, ''), 'waitlist'),
  status = CASE
    WHEN status IN ('new', 'contacted', 'qualified', 'converted') THEN status
    ELSE 'new'
  END;

COMMIT;
