ALTER TABLE public.onboarding_submissions
  ADD COLUMN IF NOT EXISTS template_id uuid;