-- Catalog of add-ons admins can manage
CREATE TABLE public.addons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price_pkr integer NOT NULL DEFAULT 0,
  pricing_type text NOT NULL DEFAULT 'one_time' CHECK (pricing_type IN ('one_time','monthly')),
  is_enabled boolean NOT NULL DEFAULT true,
  is_recommended boolean NOT NULL DEFAULT false,
  is_popular boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  icon text,
  applicable_plans jsonb NOT NULL DEFAULT '["free","rent","buy"]'::jsonb,
  dependencies jsonb NOT NULL DEFAULT '[]'::jsonb,
  per_unit_label text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.addons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view enabled addons"
ON public.addons FOR SELECT
USING (is_enabled = true);

CREATE POLICY "Admins can manage addons"
ON public.addons FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_addons_updated_at
BEFORE UPDATE ON public.addons
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Junction table linking onboarding submissions to selected add-ons
CREATE TABLE public.onboarding_addons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES public.onboarding_submissions(id) ON DELETE CASCADE,
  addon_id uuid NOT NULL REFERENCES public.addons(id) ON DELETE RESTRICT,
  price_snapshot_pkr integer NOT NULL DEFAULT 0,
  pricing_type_snapshot text NOT NULL DEFAULT 'one_time',
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (submission_id, addon_id)
);

CREATE INDEX idx_onboarding_addons_submission ON public.onboarding_addons(submission_id);

ALTER TABLE public.onboarding_addons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own selections"
ON public.onboarding_addons FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.onboarding_submissions s
  WHERE s.id = onboarding_addons.submission_id AND s.user_id = auth.uid()
));

CREATE POLICY "Users can add own selections"
ON public.onboarding_addons FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.onboarding_submissions s
  WHERE s.id = onboarding_addons.submission_id AND s.user_id = auth.uid()
));

CREATE POLICY "Users can update own selections"
ON public.onboarding_addons FOR UPDATE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.onboarding_submissions s
  WHERE s.id = onboarding_addons.submission_id AND s.user_id = auth.uid()
));

CREATE POLICY "Users can remove own selections"
ON public.onboarding_addons FOR DELETE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.onboarding_submissions s
  WHERE s.id = onboarding_addons.submission_id AND s.user_id = auth.uid()
));

CREATE POLICY "Admins can manage all selections"
ON public.onboarding_addons FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Seed initial add-ons (PKR pricing — converted from USD spec at ~280 PKR/USD)
INSERT INTO public.addons (name, description, price_pkr, pricing_type, is_recommended, is_popular, sort_order, icon, per_unit_label) VALUES
('Blog System', 'Publish articles and grow organic SEO traffic.', 2800, 'one_time', true, false, 10, 'FileText', NULL),
('Reviews & Ratings', 'Build trust with star ratings and customer reviews.', 4200, 'one_time', true, true, 20, 'Star', NULL),
('Portfolio / Gallery', 'Showcase your work in a beautiful filterable gallery.', 3400, 'one_time', false, false, 30, 'Image', NULL),
('Live Chat Integration', 'Talk to visitors in real-time and capture leads.', 2200, 'one_time', false, true, 40, 'MessageCircle', NULL),
('Multi-language Support', 'Reach global customers with multiple languages.', 5600, 'one_time', false, false, 50, 'Languages', NULL),
('Advanced SEO Optimization', 'Boost your Google ranking with on-page SEO tuning.', 7000, 'one_time', true, true, 60, 'TrendingUp', NULL),
('Speed Optimization', 'Faster load times for higher conversions.', 4200, 'one_time', true, false, 70, 'Zap', NULL),
('Custom Pages', 'Add bespoke pages designed for your business.', 1400, 'one_time', false, false, 80, 'FilePlus', 'per page'),
('Email Marketing Integration', 'Connect Mailchimp / Brevo and start newsletters.', 5000, 'one_time', false, false, 90, 'Mail', NULL),
('Analytics Dashboard', 'Track sales, visitors and conversions in one place.', 3400, 'monthly', false, true, 100, 'BarChart3', NULL);