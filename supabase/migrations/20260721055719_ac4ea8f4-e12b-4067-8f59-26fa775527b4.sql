
CREATE TABLE public.template_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES public.templates(id) ON DELETE CASCADE,
  integration_id uuid NOT NULL REFERENCES public.integrations(id) ON DELETE CASCADE,
  is_recommended boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (template_id, integration_id)
);

GRANT SELECT ON public.template_integrations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.template_integrations TO authenticated;
GRANT ALL ON public.template_integrations TO service_role;

ALTER TABLE public.template_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "template_integrations are viewable by everyone"
  ON public.template_integrations FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert template_integrations"
  ON public.template_integrations FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update template_integrations"
  ON public.template_integrations FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete template_integrations"
  ON public.template_integrations FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER update_template_integrations_updated_at
  BEFORE UPDATE ON public.template_integrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_template_integrations_template ON public.template_integrations(template_id);
CREATE INDEX idx_template_integrations_integration ON public.template_integrations(integration_id);
