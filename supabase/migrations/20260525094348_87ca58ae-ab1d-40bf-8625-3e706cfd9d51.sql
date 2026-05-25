ALTER TABLE public.templates
  ADD COLUMN IF NOT EXISTS preset_pages jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS preset_modules jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS preset_conditional_fields jsonb NOT NULL DEFAULT '[]'::jsonb;