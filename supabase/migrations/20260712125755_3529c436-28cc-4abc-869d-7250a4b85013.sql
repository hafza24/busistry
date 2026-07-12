
ALTER TABLE public.templates
  ADD COLUMN IF NOT EXISTS price_with_admin_pkr numeric,
  ADD COLUMN IF NOT EXISTS price_without_admin_pkr numeric,
  ADD COLUMN IF NOT EXISTS admin_features jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS long_description text;
