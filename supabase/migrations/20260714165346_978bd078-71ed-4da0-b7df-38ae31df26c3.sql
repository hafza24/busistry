
CREATE TABLE public.moderation_notification_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  moderator_id uuid,
  moderation_status public.profile_status NOT NULL,
  reason text,
  email_to text,
  in_app_status text NOT NULL DEFAULT 'queued',
  in_app_error text,
  email_status text NOT NULL DEFAULT 'queued',
  email_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.moderation_notification_logs TO authenticated;
GRANT ALL ON public.moderation_notification_logs TO service_role;

ALTER TABLE public.moderation_notification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view moderation logs"
  ON public.moderation_notification_logs
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE INDEX moderation_notification_logs_user_id_idx ON public.moderation_notification_logs(user_id);
CREATE INDEX moderation_notification_logs_created_at_idx ON public.moderation_notification_logs(created_at DESC);

CREATE TRIGGER moderation_notification_logs_updated_at
  BEFORE UPDATE ON public.moderation_notification_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
