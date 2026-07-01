
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  source_type text NOT NULL CHECK (source_type IN ('website_order','store_addon','upgrade_order','store_plan')),
  source_id uuid NOT NULL,
  store_id uuid,
  label text NOT NULL,
  amount_pkr numeric NOT NULL DEFAULT 0,
  cycle_days integer NOT NULL DEFAULT 30,
  current_period_start timestamptz NOT NULL DEFAULT now(),
  current_period_end timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','past_due','cancelled','expired')),
  auto_renew boolean NOT NULL DEFAULT true,
  last_reminder_day integer,
  last_reminder_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source_type, source_id)
);
CREATE INDEX idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_period_end ON public.subscriptions(current_period_end);

GRANT SELECT, UPDATE ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own subscriptions" ON public.subscriptions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Users update own subscription auto_renew" ON public.subscriptions
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  audience text NOT NULL DEFAULT 'user' CHECK (audience IN ('user','admin')),
  type text NOT NULL,
  title text NOT NULL,
  body text,
  link text,
  subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_user ON public.notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_audience ON public.notifications(audience, created_at DESC);

GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notifications" ON public.notifications
  FOR SELECT TO authenticated
  USING (
    (audience = 'user' AND auth.uid() = user_id)
    OR (audience = 'admin' AND public.has_role(auth.uid(), 'admin'::public.app_role))
  );

CREATE POLICY "Users mark own notifications read" ON public.notifications
  FOR UPDATE TO authenticated
  USING (
    (audience = 'user' AND auth.uid() = user_id)
    OR (audience = 'admin' AND public.has_role(auth.uid(), 'admin'::public.app_role))
  );

-- Backfill
INSERT INTO public.subscriptions (user_id, source_type, source_id, label, amount_pkr, cycle_days, current_period_start, current_period_end, status)
SELECT wo.user_id, 'website_order', wo.id,
  COALESCE(wo.store_name, 'Website') || ' hosting',
  COALESCE(wo.amount, 0), 30,
  COALESCE(wo.created_at, now()),
  COALESCE(wo.created_at, now()) + interval '30 days', 'active'
FROM public.website_orders wo
WHERE wo.status IN ('completed','activated','delivered','paid')
ON CONFLICT (source_type, source_id) DO NOTHING;

INSERT INTO public.subscriptions (user_id, source_type, source_id, store_id, label, amount_pkr, cycle_days, current_period_start, current_period_end, status)
SELECT sa.user_id, 'store_addon', sa.id, sa.store_id,
  COALESCE(sa.item_type, 'Add-on'),
  COALESCE(sa.price_snapshot_pkr, 0), 30,
  COALESCE(sa.created_at, now()),
  COALESCE(sa.created_at, now()) + interval '30 days', 'active'
FROM public.store_addons sa
WHERE sa.status IN ('approved','active','completed')
ON CONFLICT (source_type, source_id) DO NOTHING;

INSERT INTO public.subscriptions (user_id, source_type, source_id, store_id, label, amount_pkr, cycle_days, current_period_start, current_period_end, status)
SELECT uo.user_id, 'upgrade_order', uo.id, uo.store_id,
  COALESCE(uo.details->>'label', uo.details->>'target_plan_name', uo.upgrade_type),
  COALESCE(uo.amount, 0), 30,
  COALESCE(uo.created_at, now()),
  COALESCE(uo.created_at, now()) + interval '30 days', 'active'
FROM public.upgrade_orders uo
WHERE uo.status IN ('approved','active','completed')
ON CONFLICT (source_type, source_id) DO NOTHING;

ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
