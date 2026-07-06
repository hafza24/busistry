-- Extend templates with sale fields
ALTER TABLE public.templates
  ADD COLUMN IF NOT EXISTS original_price_pkr numeric,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'available',
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tech_stack text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS slug text;

-- Move sites_for_sale rows into templates (if the table still exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='sites_for_sale') THEN
    INSERT INTO public.templates (
      name, niche, description, category, subcategory,
      preview_image_url, demo_url, features, price_pkr,
      original_price_pkr, status, sort_order, tech_stack, slug, is_active
    )
    SELECT
      s.title,
      COALESCE(NULLIF(s.category, ''), 'general'),
      s.description,
      s.category,
      NULL,
      s.preview_image_url,
      s.demo_url,
      COALESCE(s.features, '[]'::jsonb),
      COALESCE(s.price_pkr, 0)::integer,
      s.original_price_pkr,
      COALESCE(s.status, 'available'),
      COALESCE(s.sort_order, 0),
      COALESCE(s.tech_stack, '{}'::text[]),
      s.slug,
      COALESCE(s.is_active, true)
    FROM public.sites_for_sale s;
  END IF;
END $$;

-- Drop the old table
DROP TABLE IF EXISTS public.sites_for_sale CASCADE;