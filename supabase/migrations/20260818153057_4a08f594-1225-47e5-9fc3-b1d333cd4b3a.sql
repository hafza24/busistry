-- Final Security hardening for SECURITY DEFINER functions
-- We need to explicitly revoke from 'anon' and 'authenticated' if they shouldn't call these.
-- By default 'PUBLIC' includes 'anon' and 'authenticated'.

-- (1) Functions that should only be callable by service_role (Triggers/Internal)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_order_item_insert() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.on_review_created() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.prevent_self_moderation_bypass_profiles() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.prevent_self_moderation_bypass_subscriptions() FROM anon, authenticated;

-- (2) Functions that should only be callable by admins (via authenticated)
-- We'll keep authenticated EXECUTE but the internal is_admin check protects them.
-- However, for extra safety we can revoke from anon.
REVOKE EXECUTE ON FUNCTION public.admin_dashboard_stats() FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_recent_activity(integer) FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_revenue_summary() FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_active_returning_users(integer) FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_period_metrics(integer) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_website_order_credentials(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.set_website_order_credentials(uuid, text, text, text) FROM anon;

-- (3) Functions for storefront (authenticated only)
REVOKE EXECUTE ON FUNCTION public.create_order_with_items(uuid, text, text, text, text, text, numeric, numeric, jsonb) FROM anon;
REVOKE EXECUTE ON FUNCTION public.lookup_order_items(text, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.lookup_order_status(text, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.can_review(uuid, text, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_pending_review_prompts() FROM anon;
REVOKE EXECUTE ON FUNCTION public.apply_upgrade_order(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.apply_catalog_order(uuid) FROM anon;

-- (4) has_role/is_admin (helper functions)
-- These are safe to leave for authenticated, but revoke from anon to reduce surface.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;
