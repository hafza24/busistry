ALTER TABLE public.plans
  ADD COLUMN IF NOT EXISTS max_pages integer NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS domain_type text NOT NULL DEFAULT 'subdomain',
  ADD COLUMN IF NOT EXISTS platform_type text NOT NULL DEFAULT 'wordpress',
  ADD COLUMN IF NOT EXISTS email_accounts integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS team_users integer NOT NULL DEFAULT 1;