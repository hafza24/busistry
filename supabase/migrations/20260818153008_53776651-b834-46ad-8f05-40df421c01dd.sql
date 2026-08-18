-- (1) Fix Search Path Mutable (on_review_created)
CREATE OR REPLACE FUNCTION public.on_review_created()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  RETURN NEW;
END;
$function$;

-- (2) Revoke EXECUTE from PUBLIC/authenticated for trigger/internal functions
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.validate_order_item_insert() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.on_review_created() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.prevent_self_moderation_bypass_profiles() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.prevent_self_moderation_bypass_subscriptions() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.validate_order_item_insert() TO service_role;
GRANT EXECUTE ON FUNCTION public.on_review_created() TO service_role;
GRANT EXECUTE ON FUNCTION public.prevent_self_moderation_bypass_profiles() TO service_role;
GRANT EXECUTE ON FUNCTION public.prevent_self_moderation_bypass_subscriptions() TO service_role;

-- (3) Revoke EXECUTE from PUBLIC for admin functions (restrict to authenticated)
REVOKE EXECUTE ON FUNCTION public.admin_dashboard_stats() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_recent_activity(integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_revenue_summary() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_active_returning_users(integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_period_metrics(integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_website_order_credentials(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.set_website_order_credentials(uuid, text, text, text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.admin_dashboard_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_recent_activity(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_revenue_summary() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_active_returning_users(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_period_metrics(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_website_order_credentials(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_website_order_credentials(uuid, text, text, text) TO authenticated;
