
ALTER TABLE public.stores
  ADD COLUMN IF NOT EXISTS extra_products integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS extra_categories integer NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.apply_upgrade_order(p_order_id uuid)
RETURNS TABLE(order_id uuid, store_id uuid, upgrade_type text, status text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order public.upgrade_orders%ROWTYPE;
  v_qty int;
  v_days int;
  v_new_plan uuid;
  v_now timestamptz := now();
  v_expires timestamptz;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Forbidden' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_order FROM public.upgrade_orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found' USING ERRCODE = 'P0002';
  END IF;

  IF v_order.status = 'completed' THEN
    RETURN QUERY SELECT v_order.id, v_order.store_id, v_order.upgrade_type, v_order.status;
    RETURN;
  END IF;

  v_qty := COALESCE((v_order.details->>'quantity')::int, 0);

  IF v_order.upgrade_type = 'product_limit' THEN
    UPDATE public.stores SET extra_products = COALESCE(extra_products,0) + GREATEST(v_qty,0) WHERE id = v_order.store_id;

  ELSIF v_order.upgrade_type = 'category_limit' THEN
    UPDATE public.stores SET extra_categories = COALESCE(extra_categories,0) + GREATEST(v_qty,0) WHERE id = v_order.store_id;

  ELSIF v_order.upgrade_type = 'extend_duration' THEN
    v_days := COALESCE((v_order.details->>'days')::int, v_qty, 0);
    SELECT expires_at INTO v_expires FROM public.stores WHERE id = v_order.store_id;
    IF v_expires IS NULL OR v_expires < v_now THEN v_expires := v_now; END IF;
    UPDATE public.stores SET expires_at = v_expires + make_interval(days => GREATEST(v_days,0)) WHERE id = v_order.store_id;

  ELSIF v_order.upgrade_type = 'plan_change' THEN
    v_new_plan := NULLIF(v_order.details->>'target_plan_id','')::uuid;
    IF v_new_plan IS NOT NULL THEN
      UPDATE public.stores SET plan_id = v_new_plan WHERE id = v_order.store_id;
    END IF;

  ELSIF v_order.upgrade_type = 'content_tweak' THEN
    -- No automated store mutation; fulfillment handled by admin/team.
    NULL;
  END IF;

  UPDATE public.upgrade_orders
    SET status = 'completed',
        admin_notes = COALESCE(admin_notes, '') ||
          CASE WHEN COALESCE(admin_notes,'') = '' THEN '' ELSE E'\n' END ||
          '[auto] Applied by ' || COALESCE((SELECT email FROM auth.users WHERE id = auth.uid()), 'admin') || ' at ' || v_now::text,
        updated_at = v_now
    WHERE id = p_order_id;

  RETURN QUERY SELECT v_order.id, v_order.store_id, v_order.upgrade_type, 'completed'::text;
END;
$$;

REVOKE ALL ON FUNCTION public.apply_upgrade_order(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.apply_upgrade_order(uuid) TO authenticated;
