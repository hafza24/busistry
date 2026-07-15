
DO $$ BEGIN
  CREATE TYPE public.catalog_item_type AS ENUM (
    'addon','integration','page','section','popup',
    'plan_upgrade','product_limit','category_limit','extend_duration','content_tweak'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.catalog_pricing_type AS ENUM ('one_time','monthly','per_unit');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.catalog_order_status AS ENUM (
    'pending','approved','in_progress','active','completed','rejected'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.catalog_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  short_description text,
  long_description text,
  type public.catalog_item_type NOT NULL,
  category text,
  price_pkr numeric NOT NULL DEFAULT 0,
  pricing_type public.catalog_pricing_type NOT NULL DEFAULT 'one_time',
  per_unit_label text,
  icon text,
  cover_image text,
  demo_url text,
  gallery jsonb NOT NULL DEFAULT '[]'::jsonb,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  faq jsonb NOT NULL DEFAULT '[]'::jsonb,
  applicable_plans text[] NOT NULL DEFAULT '{}',
  applicable_types text[] NOT NULL DEFAULT '{}',
  meta_title text,
  meta_description text,
  meta_keywords text,
  og_image text,
  is_enabled boolean NOT NULL DEFAULT true,
  is_recommended boolean NOT NULL DEFAULT false,
  is_popular boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  related_item_ids uuid[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.catalog_items TO anon;
GRANT SELECT ON public.catalog_items TO authenticated;
GRANT ALL ON public.catalog_items TO service_role;

ALTER TABLE public.catalog_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enabled catalog items are public"
  ON public.catalog_items FOR SELECT
  USING (is_enabled = true OR public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins manage catalog items"
  ON public.catalog_items FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER catalog_items_updated_at
  BEFORE UPDATE ON public.catalog_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_catalog_items_type ON public.catalog_items(type);
CREATE INDEX IF NOT EXISTS idx_catalog_items_enabled ON public.catalog_items(is_enabled);
CREATE INDEX IF NOT EXISTS idx_catalog_items_sort ON public.catalog_items(sort_order);

CREATE TABLE IF NOT EXISTS public.catalog_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  store_id uuid REFERENCES public.stores(id) ON DELETE SET NULL,
  item_id uuid REFERENCES public.catalog_items(id) ON DELETE SET NULL,
  item_type_snapshot public.catalog_item_type NOT NULL,
  name_snapshot text NOT NULL,
  price_snapshot_pkr numeric NOT NULL DEFAULT 0,
  pricing_type_snapshot public.catalog_pricing_type NOT NULL DEFAULT 'one_time',
  quantity integer NOT NULL DEFAULT 1,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  status public.catalog_order_status NOT NULL DEFAULT 'pending',
  payment_method text,
  transaction_id text,
  screenshot_url text,
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.catalog_orders TO authenticated;
GRANT ALL ON public.catalog_orders TO service_role;

ALTER TABLE public.catalog_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their own catalog orders"
  ON public.catalog_orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Users create their own catalog orders"
  ON public.catalog_orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins update catalog orders"
  ON public.catalog_orders FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins delete catalog orders"
  ON public.catalog_orders FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER catalog_orders_updated_at
  BEFORE UPDATE ON public.catalog_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_catalog_orders_user ON public.catalog_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_catalog_orders_store ON public.catalog_orders(store_id);
CREATE INDEX IF NOT EXISTS idx_catalog_orders_status ON public.catalog_orders(status);
CREATE INDEX IF NOT EXISTS idx_catalog_orders_type ON public.catalog_orders(item_type_snapshot);

ALTER PUBLICATION supabase_realtime ADD TABLE public.catalog_orders;

-- Backfill: addons -> catalog_items
INSERT INTO public.catalog_items (
  slug, name, short_description, long_description, type,
  price_pkr, pricing_type, per_unit_label, icon,
  is_enabled, is_recommended, is_popular, sort_order
)
SELECT
  lower(regexp_replace(a.name, '[^a-zA-Z0-9]+','-','g')) || '-a-' || substr(a.id::text,1,6),
  a.name,
  a.description,
  a.description,
  'addon'::public.catalog_item_type,
  COALESCE(a.price_pkr, 0),
  CASE lower(coalesce(a.pricing_type::text,'one_time'))
    WHEN 'monthly' THEN 'monthly'::public.catalog_pricing_type
    WHEN 'per_unit' THEN 'per_unit'::public.catalog_pricing_type
    ELSE 'one_time'::public.catalog_pricing_type
  END,
  a.per_unit_label,
  a.icon,
  COALESCE(a.is_enabled, true),
  COALESCE(a.is_recommended, false),
  COALESCE(a.is_popular, false),
  COALESCE(a.sort_order, 0)
FROM public.addons a
ON CONFLICT (slug) DO NOTHING;

-- Backfill: integrations -> catalog_items
INSERT INTO public.catalog_items (
  slug, name, short_description, long_description, type, category,
  price_pkr, pricing_type, icon, is_enabled, is_popular, sort_order
)
SELECT
  COALESCE(NULLIF(i.slug,''), lower(regexp_replace(i.name,'[^a-zA-Z0-9]+','-','g'))) || '-i-' || substr(i.id::text,1,6),
  i.name,
  i.description,
  i.description,
  'integration'::public.catalog_item_type,
  i.category,
  COALESCE(i.price_pkr, 0),
  CASE lower(coalesce(i.pricing_type::text,'one_time'))
    WHEN 'monthly' THEN 'monthly'::public.catalog_pricing_type
    WHEN 'per_unit' THEN 'per_unit'::public.catalog_pricing_type
    ELSE 'one_time'::public.catalog_pricing_type
  END,
  i.icon,
  COALESCE(i.is_enabled, true),
  COALESCE(i.is_popular, false),
  COALESCE(i.sort_order, 0)
FROM public.integrations i
ON CONFLICT (slug) DO NOTHING;

-- Backfill: website_products -> catalog_items
INSERT INTO public.catalog_items (
  slug, name, short_description, long_description, type, category,
  price_pkr, pricing_type, cover_image, demo_url,
  features, faq,
  meta_title, meta_description, meta_keywords, og_image,
  is_enabled, is_popular, sort_order
)
SELECT
  COALESCE(NULLIF(wp.slug,''), lower(regexp_replace(wp.name,'[^a-zA-Z0-9]+','-','g'))) || '-w-' || substr(wp.id::text,1,6),
  wp.name,
  wp.description,
  COALESCE(wp.long_description, wp.description),
  CASE lower(coalesce(wp.type::text,''))
    WHEN 'page' THEN 'page'
    WHEN 'section' THEN 'section'
    WHEN 'popup' THEN 'popup'
    WHEN 'integration' THEN 'integration'
    ELSE 'addon'
  END::public.catalog_item_type,
  wp.category,
  COALESCE(wp.price_pkr, 0),
  'one_time'::public.catalog_pricing_type,
  wp.preview_image_url,
  wp.demo_url,
  CASE
    WHEN wp.features IS NULL THEN '[]'::jsonb
    WHEN jsonb_typeof(to_jsonb(wp.features)) = 'array' THEN to_jsonb(wp.features)
    ELSE '[]'::jsonb
  END,
  CASE
    WHEN wp.faq IS NULL THEN '[]'::jsonb
    WHEN jsonb_typeof(to_jsonb(wp.faq)) = 'array' THEN to_jsonb(wp.faq)
    ELSE '[]'::jsonb
  END,
  wp.seo_title,
  wp.seo_description,
  wp.seo_keywords,
  wp.og_image_url,
  COALESCE(wp.is_enabled, true),
  COALESCE(wp.is_popular, false),
  COALESCE(wp.sort_order, 0)
FROM public.website_products wp
ON CONFLICT (slug) DO NOTHING;

-- Backfill: store_addons -> catalog_orders
INSERT INTO public.catalog_orders (
  user_id, store_id, item_id, item_type_snapshot, name_snapshot,
  price_snapshot_pkr, pricing_type_snapshot, quantity, config,
  status, payment_method, transaction_id, screenshot_url, admin_notes, created_at, updated_at
)
SELECT
  sa.user_id,
  sa.store_id,
  NULL::uuid,
  CASE lower(coalesce(sa.item_type::text,''))
    WHEN 'integration' THEN 'integration'
    WHEN 'page' THEN 'page'
    WHEN 'section' THEN 'section'
    WHEN 'popup' THEN 'popup'
    ELSE 'addon'
  END::public.catalog_item_type,
  COALESCE(sa.item_type::text, 'Add-on'),
  COALESCE(sa.price_snapshot_pkr, 0),
  CASE lower(coalesce(sa.pricing_type_snapshot::text,'one_time'))
    WHEN 'monthly' THEN 'monthly'::public.catalog_pricing_type
    WHEN 'per_unit' THEN 'per_unit'::public.catalog_pricing_type
    ELSE 'one_time'::public.catalog_pricing_type
  END,
  1,
  COALESCE(sa.config, '{}'::jsonb),
  CASE lower(coalesce(sa.status::text,'pending'))
    WHEN 'active' THEN 'active'
    WHEN 'delivered' THEN 'completed'
    WHEN 'completed' THEN 'completed'
    WHEN 'paid' THEN 'approved'
    WHEN 'rejected' THEN 'rejected'
    WHEN 'in_progress' THEN 'in_progress'
    ELSE 'pending'
  END::public.catalog_order_status,
  sa.payment_method,
  sa.transaction_id,
  sa.screenshot_url,
  sa.admin_notes,
  sa.created_at,
  sa.updated_at
FROM public.store_addons sa
WHERE sa.user_id IS NOT NULL;

-- Backfill: upgrade_orders -> catalog_orders
INSERT INTO public.catalog_orders (
  user_id, store_id, item_id, item_type_snapshot, name_snapshot,
  price_snapshot_pkr, pricing_type_snapshot, quantity, config,
  status, payment_method, transaction_id, screenshot_url, admin_notes, created_at, updated_at
)
SELECT
  uo.user_id,
  uo.store_id,
  NULL::uuid,
  CASE lower(coalesce(uo.upgrade_type::text,''))
    WHEN 'product_limit' THEN 'product_limit'
    WHEN 'category_limit' THEN 'category_limit'
    WHEN 'extend_duration' THEN 'extend_duration'
    WHEN 'plan_change' THEN 'plan_upgrade'
    WHEN 'content_tweak' THEN 'content_tweak'
    ELSE 'content_tweak'
  END::public.catalog_item_type,
  COALESCE(uo.upgrade_type::text, 'Upgrade'),
  COALESCE(uo.amount, 0),
  'one_time'::public.catalog_pricing_type,
  1,
  COALESCE(uo.details, '{}'::jsonb),
  CASE lower(coalesce(uo.status::text,'pending'))
    WHEN 'completed' THEN 'completed'
    WHEN 'paid' THEN 'approved'
    WHEN 'rejected' THEN 'rejected'
    WHEN 'in_progress' THEN 'in_progress'
    ELSE 'pending'
  END::public.catalog_order_status,
  uo.payment_method,
  uo.transaction_id,
  uo.screenshot_url,
  uo.admin_notes,
  uo.created_at,
  uo.updated_at
FROM public.upgrade_orders uo
WHERE uo.user_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.apply_catalog_order(p_order_id uuid)
RETURNS TABLE(order_id uuid, item_type public.catalog_item_type, status public.catalog_order_status)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v public.catalog_orders%ROWTYPE;
  v_qty int;
  v_days int;
  v_new_plan uuid;
  v_now timestamptz := now();
  v_expires timestamptz;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Forbidden' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v FROM public.catalog_orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found' USING ERRCODE = 'P0002';
  END IF;

  IF v.status = 'completed' THEN
    RETURN QUERY SELECT v.id, v.item_type_snapshot, v.status;
    RETURN;
  END IF;

  v_qty := COALESCE((v.config->>'quantity')::int, v.quantity, 0);

  IF v.item_type_snapshot = 'product_limit' AND v.store_id IS NOT NULL THEN
    UPDATE public.stores SET extra_products = COALESCE(extra_products,0) + GREATEST(v_qty,0) WHERE id = v.store_id;
  ELSIF v.item_type_snapshot = 'category_limit' AND v.store_id IS NOT NULL THEN
    UPDATE public.stores SET extra_categories = COALESCE(extra_categories,0) + GREATEST(v_qty,0) WHERE id = v.store_id;
  ELSIF v.item_type_snapshot = 'extend_duration' AND v.store_id IS NOT NULL THEN
    v_days := COALESCE((v.config->>'days')::int, v_qty, 0);
    SELECT expires_at INTO v_expires FROM public.stores WHERE id = v.store_id;
    IF v_expires IS NULL OR v_expires < v_now THEN v_expires := v_now; END IF;
    UPDATE public.stores SET expires_at = v_expires + make_interval(days => GREATEST(v_days,0)) WHERE id = v.store_id;
  ELSIF v.item_type_snapshot = 'plan_upgrade' AND v.store_id IS NOT NULL THEN
    v_new_plan := NULLIF(v.config->>'target_plan_id','')::uuid;
    IF v_new_plan IS NOT NULL THEN
      UPDATE public.stores SET plan_id = v_new_plan WHERE id = v.store_id;
    END IF;
  END IF;

  UPDATE public.catalog_orders
    SET status = CASE WHEN item_type_snapshot IN ('addon','integration','page','section','popup')
                      THEN 'active'::public.catalog_order_status
                      ELSE 'completed'::public.catalog_order_status END,
        updated_at = v_now
    WHERE id = p_order_id;

  RETURN QUERY SELECT v.id, v.item_type_snapshot,
    CASE WHEN v.item_type_snapshot IN ('addon','integration','page','section','popup')
         THEN 'active'::public.catalog_order_status
         ELSE 'completed'::public.catalog_order_status END;
END;
$$;

REVOKE ALL ON FUNCTION public.apply_catalog_order(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.apply_catalog_order(uuid) TO authenticated;
