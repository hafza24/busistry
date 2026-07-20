
-- Template ↔ Plan compatibility mapping
CREATE TABLE IF NOT EXISTS public.template_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES public.templates(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  is_recommended boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (template_id, plan_id)
);

CREATE INDEX IF NOT EXISTS template_plans_template_idx ON public.template_plans(template_id);
CREATE INDEX IF NOT EXISTS template_plans_plan_idx ON public.template_plans(plan_id);

GRANT SELECT ON public.template_plans TO anon;
GRANT SELECT ON public.template_plans TO authenticated;
GRANT ALL ON public.template_plans TO service_role;

ALTER TABLE public.template_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Template plans are viewable by everyone"
  ON public.template_plans FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert template plans"
  ON public.template_plans FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update template plans"
  ON public.template_plans FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete template plans"
  ON public.template_plans FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER update_template_plans_updated_at
  BEFORE UPDATE ON public.template_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
