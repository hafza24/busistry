-- 1. store_settings: restrict public access
DROP POLICY IF EXISTS "Public can view store settings" ON public.store_settings;

CREATE POLICY "Public can view settings of activated stores (safe cols only via view)"
ON public.store_settings FOR SELECT TO public
USING (
  EXISTS (
    SELECT 1 FROM public.stores
    WHERE stores.id = store_settings.store_id
      AND stores.status = 'activated'
  )
);

-- Safe public view exposing only non-sensitive storefront fields
CREATE OR REPLACE VIEW public.public_store_settings
WITH (security_invoker = true) AS
SELECT
  ss.id,
  ss.store_id,
  ss.logo_url,
  ss.banner_url,
  ss.description,
  ss.primary_color,
  ss.secondary_color,
  ss.contact_phone
FROM public.store_settings ss
JOIN public.stores s ON s.id = ss.store_id
WHERE s.status = 'activated';

GRANT SELECT ON public.public_store_settings TO anon, authenticated;

-- 2. order_items: tighten public insert to recent orders only (5 min window)
DROP POLICY IF EXISTS "Public can insert order items" ON public.order_items;

CREATE POLICY "Public can insert order items for recent orders"
ON public.order_items FOR INSERT TO public
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
      AND orders.created_at > now() - interval '5 minutes'
  )
);

-- 3. upgrade_orders: allow owner to update pending orders
CREATE POLICY "Users update own pending upgrade orders"
ON public.upgrade_orders FOR UPDATE TO authenticated
USING (auth.uid() = user_id AND status = 'pending')
WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- 4. store_requests: allow owner to update pending requests
CREATE POLICY "Users update own pending requests"
ON public.store_requests FOR UPDATE TO authenticated
USING (auth.uid() = user_id AND status = 'pending')
WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- 5. Storage: drop broad public listing policy on store-assets
DROP POLICY IF EXISTS "Public can view store assets" ON storage.objects;

-- 6. SECURITY DEFINER functions: lock down EXECUTE
REVOKE EXECUTE ON FUNCTION public.validate_order_item_insert() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;