ALTER TABLE public.integrations ADD COLUMN IF NOT EXISTS price_pkr integer NOT NULL DEFAULT 0;
ALTER TABLE public.onboarding_submissions ADD COLUMN IF NOT EXISTS selected_integration_ids uuid[] NOT NULL DEFAULT '{}';
ALTER TABLE public.onboarding_submissions ADD COLUMN IF NOT EXISTS integrations_total_pkr integer NOT NULL DEFAULT 0;