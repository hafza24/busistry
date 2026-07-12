
-- 1. Audit logs: prevent NULL/system-attributed forgery
DROP POLICY IF EXISTS "Users can insert own audit logs" ON public.audit_logs;
CREATE POLICY "Users can insert own audit logs"
  ON public.audit_logs FOR INSERT TO authenticated
  WITH CHECK (user_id IS NOT NULL AND user_id = auth.uid());

-- 2. Store settings: admin ALL policy needs matching WITH CHECK
DROP POLICY IF EXISTS "Admins can manage all settings" ON public.store_settings;
CREATE POLICY "Admins can manage all settings"
  ON public.store_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 3. Website orders: ensure WP credential columns are not directly selectable/updatable
REVOKE SELECT (wordpress_url, wordpress_username, wordpress_password) ON public.website_orders FROM authenticated;
REVOKE SELECT (wordpress_url, wordpress_username, wordpress_password) ON public.website_orders FROM anon;
REVOKE UPDATE (wordpress_url, wordpress_username, wordpress_password) ON public.website_orders FROM authenticated;
REVOKE UPDATE (wordpress_url, wordpress_username, wordpress_password) ON public.website_orders FROM anon;
REVOKE INSERT (wordpress_url, wordpress_username, wordpress_password) ON public.website_orders FROM authenticated;
REVOKE INSERT (wordpress_url, wordpress_username, wordpress_password) ON public.website_orders FROM anon;
