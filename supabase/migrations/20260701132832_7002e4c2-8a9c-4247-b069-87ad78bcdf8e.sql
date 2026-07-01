
DO $$
DECLARE
  fn text;
  auth_only text[] := ARRAY[
    'admin_new_users_month()',
    'admin_new_users_today()',
    'admin_total_users()',
    'admin_active_returning_users(integer)',
    'admin_period_metrics(integer)',
    'admin_dashboard_stats()',
    'admin_recent_activity(integer)',
    'admin_revenue_summary()',
    'set_website_order_credentials(uuid, text, text, text)',
    'get_website_order_credentials(uuid)',
    'is_admin()'
  ];
BEGIN
  FOREACH fn IN ARRAY auth_only LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION public.%s FROM PUBLIC', fn);
    EXECUTE format('REVOKE ALL ON FUNCTION public.%s FROM anon', fn);
    EXECUTE format('GRANT EXECUTE ON FUNCTION public.%s TO authenticated', fn);
    EXECUTE format('GRANT EXECUTE ON FUNCTION public.%s TO service_role', fn);
  END LOOP;
END $$;
