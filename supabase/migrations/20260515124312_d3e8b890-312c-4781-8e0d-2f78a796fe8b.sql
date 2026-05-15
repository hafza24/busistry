-- Marketplace catalog: Pages, Sections, Popups
CREATE TABLE public.website_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('page','section','popup')),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT,
  price_pkr INTEGER NOT NULL DEFAULT 0,
  preview_image_url TEXT,
  demo_url TEXT,
  applicable_templates JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  is_popular BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.website_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view enabled website products" ON public.website_products FOR SELECT USING (is_enabled = true);
CREATE POLICY "Admins manage website products" ON public.website_products FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_website_products_updated BEFORE UPDATE ON public.website_products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Integrations catalog
CREATE TABLE public.integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  category TEXT,
  price_pkr INTEGER NOT NULL DEFAULT 0,
  pricing_type TEXT NOT NULL DEFAULT 'one_time' CHECK (pricing_type IN ('one_time','monthly')),
  credential_schema JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  is_popular BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view enabled integrations" ON public.integrations FOR SELECT USING (is_enabled = true);
CREATE POLICY "Admins manage integrations" ON public.integrations FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_integrations_updated BEFORE UPDATE ON public.integrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Per-store installed add-ons (orders for B + C)
CREATE TABLE public.store_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL,
  user_id UUID NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('product','integration')),
  item_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','active','rejected')),
  price_snapshot_pkr INTEGER NOT NULL DEFAULT 0,
  pricing_type_snapshot TEXT NOT NULL DEFAULT 'one_time',
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  payment_method TEXT,
  transaction_id TEXT,
  screenshot_url TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_store_addons_store ON public.store_addons(store_id);

ALTER TABLE public.store_addons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage all store addons" ON public.store_addons FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE POLICY "Owners view own store addons" ON public.store_addons FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Owners create own store addons" ON public.store_addons FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM stores WHERE stores.id = store_id AND stores.user_id = auth.uid()));
CREATE POLICY "Owners update own store addons" ON public.store_addons FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);
CREATE TRIGGER trg_store_addons_updated BEFORE UPDATE ON public.store_addons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Upgrade orders (plan/limit increases)
CREATE TABLE public.upgrade_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  store_id UUID NOT NULL,
  upgrade_type TEXT NOT NULL CHECK (upgrade_type IN ('plan_change','product_limit','category_limit','extend_duration')),
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  amount INTEGER NOT NULL DEFAULT 0,
  payment_method TEXT,
  transaction_id TEXT,
  screenshot_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_upgrade_orders_user ON public.upgrade_orders(user_id);

ALTER TABLE public.upgrade_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage upgrade orders" ON public.upgrade_orders FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE POLICY "Users view own upgrade orders" ON public.upgrade_orders FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users create own upgrade orders" ON public.upgrade_orders FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM stores WHERE stores.id = store_id AND stores.user_id = auth.uid()));
CREATE TRIGGER trg_upgrade_orders_updated BEFORE UPDATE ON public.upgrade_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Admin-managed upgrade options (pricing tiers)
CREATE TABLE public.upgrade_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upgrade_type TEXT NOT NULL CHECK (upgrade_type IN ('product_limit','category_limit','extend_duration')),
  label TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  price_pkr INTEGER NOT NULL DEFAULT 0,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.upgrade_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public view enabled upgrade options" ON public.upgrade_options FOR SELECT USING (is_enabled = true);
CREATE POLICY "Admins manage upgrade options" ON public.upgrade_options FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));