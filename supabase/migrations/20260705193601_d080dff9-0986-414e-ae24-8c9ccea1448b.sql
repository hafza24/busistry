
CREATE TABLE public.sites_for_sale (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  category TEXT,
  tech_stack TEXT[] DEFAULT '{}',
  preview_image_url TEXT,
  demo_url TEXT,
  price_pkr NUMERIC NOT NULL DEFAULT 0,
  original_price_pkr NUMERIC,
  features JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'available',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.sites_for_sale TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sites_for_sale TO authenticated;
GRANT ALL ON public.sites_for_sale TO service_role;

ALTER TABLE public.sites_for_sale ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active listings"
  ON public.sites_for_sale FOR SELECT
  USING (is_active = true OR public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins manage listings"
  ON public.sites_for_sale FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER sites_for_sale_updated_at
  BEFORE UPDATE ON public.sites_for_sale
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
