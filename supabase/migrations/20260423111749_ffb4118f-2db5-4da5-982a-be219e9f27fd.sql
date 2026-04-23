ALTER TABLE public.onboarding_submissions
  ADD COLUMN IF NOT EXISTS project_type text,
  ADD COLUMN IF NOT EXISTS project_details jsonb NOT NULL DEFAULT '{}'::jsonb;