
-- 1) FEEDBACK PUBLIC EXPOSURE
DROP POLICY IF EXISTS "Allow public select approved feedback" ON public.feedback_submissions;

CREATE OR REPLACE VIEW public.public_feedback_reviews
WITH (security_invoker = true) AS
SELECT id, subject, message, rating, featured, created_at
FROM public.feedback_submissions
WHERE approved = true AND rating IS NOT NULL;

GRANT SELECT ON public.public_feedback_reviews TO anon, authenticated;

-- 2) ORDER ITEMS ANON INSERT BYPASS
DROP POLICY IF EXISTS "Public can insert order items for recent orders" ON public.order_items;
-- Storefront checkout now uses public.create_order_with_items (SECURITY DEFINER).

-- 3) SECURITY DEFINER anon EXECUTE — revoke on internal admin/credentials helpers
REVOKE EXECUTE ON FUNCTION public.admin_new_users_month() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.admin_new_users_today() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.admin_total_users() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.admin_active_returning_users(integer) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.admin_period_metrics(integer) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.admin_dashboard_stats() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.admin_recent_activity(integer) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.admin_revenue_summary() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.set_website_order_credentials(uuid, text, text, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_website_order_credentials(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon, public;

GRANT EXECUTE ON FUNCTION public.admin_new_users_month() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_new_users_today() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_total_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_active_returning_users(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_period_metrics(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_dashboard_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_recent_activity(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_revenue_summary() TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_website_order_credentials(uuid, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_website_order_credentials(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- 4) FUNCTION SEARCH_PATH MUTABLE — pin search_path on remaining helpers
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.update_timestamp() SET search_path = public;
ALTER FUNCTION public.is_admin() SET search_path = public;
ALTER FUNCTION public.get_feedback_rating_stats() SET search_path = public;
ALTER FUNCTION public.get_feedback_rating_distribution() SET search_path = public;
ALTER FUNCTION public.admin_new_users_month() SET search_path = public;
ALTER FUNCTION public.admin_new_users_today() SET search_path = public;
ALTER FUNCTION public.admin_total_users() SET search_path = public;
ALTER FUNCTION public.admin_active_returning_users(integer) SET search_path = public;
ALTER FUNCTION public.admin_period_metrics(integer) SET search_path = public;
ALTER FUNCTION public.admin_dashboard_stats() SET search_path = public;
ALTER FUNCTION public.admin_recent_activity(integer) SET search_path = public;
ALTER FUNCTION public.admin_revenue_summary() SET search_path = public;
ALTER FUNCTION public.increment_popup_views(uuid) SET search_path = public;
ALTER FUNCTION public.increment_popup_clicks(uuid) SET search_path = public;
