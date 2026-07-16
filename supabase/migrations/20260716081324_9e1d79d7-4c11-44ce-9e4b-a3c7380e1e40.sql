
CREATE TABLE public.case_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  tag TEXT NOT NULL DEFAULT 'Case study',
  excerpt TEXT,
  content TEXT,
  cover_image_url TEXT,
  customer_name TEXT,
  customer_role TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT[] NOT NULL DEFAULT '{}',
  og_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.case_studies TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.case_studies TO authenticated;
GRANT ALL ON public.case_studies TO service_role;

ALTER TABLE public.case_studies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published case studies"
  ON public.case_studies FOR SELECT
  USING (is_published = true OR public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can insert case studies"
  ON public.case_studies FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update case studies"
  ON public.case_studies FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete case studies"
  ON public.case_studies FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER update_case_studies_updated_at
  BEFORE UPDATE ON public.case_studies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_case_studies_published ON public.case_studies (is_published, sort_order DESC, created_at DESC);
