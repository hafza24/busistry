-- Shared helper function (idempotent)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Onboarding submissions table
CREATE TABLE public.onboarding_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_id UUID,

  business_name TEXT,
  business_type TEXT,
  business_description TEXT,
  country TEXT,

  logo_url TEXT,
  needs_logo_design BOOLEAN NOT NULL DEFAULT false,
  color_palette TEXT,
  font_style TEXT,
  reference_websites TEXT,

  team_size INTEGER,
  team_roles JSONB DEFAULT '[]'::jsonb,
  team_members JSONB DEFAULT '[]'::jsonb,

  store_type TEXT,
  product_count_estimate INTEGER,
  payment_gateway TEXT,
  shipping_requirements TEXT,
  special_features TEXT,

  full_name TEXT,
  email TEXT,
  phone TEXT,
  whatsapp TEXT,
  business_address TEXT,

  billing_cycle TEXT,
  payment_method TEXT,
  transaction_id TEXT,
  amount INTEGER,
  screenshot_url TEXT,
  terms_accepted BOOLEAN NOT NULL DEFAULT false,

  current_step INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'draft',
  submitted_at TIMESTAMPTZ,
  admin_notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.onboarding_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own submissions"
  ON public.onboarding_submissions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own submissions"
  ON public.onboarding_submissions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own submissions"
  ON public.onboarding_submissions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all submissions"
  ON public.onboarding_submissions FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_onboarding_submissions_updated_at
  BEFORE UPDATE ON public.onboarding_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_onboarding_user_status ON public.onboarding_submissions(user_id, status);