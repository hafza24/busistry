ALTER TABLE public.templates
  ADD COLUMN IF NOT EXISTS meta_title text,
  ADD COLUMN IF NOT EXISTS meta_description text,
  ADD COLUMN IF NOT EXISTS meta_keywords text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS og_image_url text,
  ADD COLUMN IF NOT EXISTS image_alt text;