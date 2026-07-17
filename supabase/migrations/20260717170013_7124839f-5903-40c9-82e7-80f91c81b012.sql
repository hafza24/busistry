
ALTER VIEW public.item_review_stats SET (security_invoker = true);

CREATE OR REPLACE FUNCTION public.prevent_self_moderation_bypass_profiles()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin') THEN RETURN NEW; END IF;
  IF NEW.status IS DISTINCT FROM OLD.status
     OR NEW.moderation_reason IS DISTINCT FROM OLD.moderation_reason
     OR NEW.moderated_at IS DISTINCT FROM OLD.moderated_at
     OR NEW.moderated_by IS DISTINCT FROM OLD.moderated_by THEN
    RAISE EXCEPTION 'Not allowed to modify moderation fields';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_self_moderation_bypass_profiles ON public.profiles;
CREATE TRIGGER trg_prevent_self_moderation_bypass_profiles
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_self_moderation_bypass_profiles();

CREATE OR REPLACE FUNCTION public.prevent_self_moderation_bypass_subscriptions()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin') THEN RETURN NEW; END IF;
  IF NEW.status IS DISTINCT FROM OLD.status
     OR NEW.moderation_reason IS DISTINCT FROM OLD.moderation_reason
     OR NEW.moderated_by IS DISTINCT FROM OLD.moderated_by
     OR NEW.moderated_at IS DISTINCT FROM OLD.moderated_at THEN
    RAISE EXCEPTION 'Not allowed to modify moderation fields';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_self_moderation_bypass_subscriptions ON public.subscriptions;
CREATE TRIGGER trg_prevent_self_moderation_bypass_subscriptions
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION public.prevent_self_moderation_bypass_subscriptions();

DROP POLICY IF EXISTS "Users update own open tickets" ON public.support_tickets;
CREATE POLICY "Users update own open tickets"
ON public.support_tickets FOR UPDATE TO authenticated
USING (auth.uid() = user_id AND status = 'open')
WITH CHECK (auth.uid() = user_id AND status = 'open');
