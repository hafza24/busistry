-- Drop unused tables and their dependent functions
DROP FUNCTION IF EXISTS public.increment_popup_views(uuid);
DROP FUNCTION IF EXISTS public.increment_popup_clicks(uuid);
DROP TABLE IF EXISTS public.site_popups CASCADE;
DROP TABLE IF EXISTS public.analytics_snapshots CASCADE;
DROP TABLE IF EXISTS public.product_packs CASCADE;

-- Update admin_dashboard_stats to remove site_popups reference
CREATE OR REPLACE FUNCTION public.admin_dashboard_stats()
 RETURNS TABLE(total_users bigint, total_orders bigint, total_revenue numeric, total_templates bigint, total_plans bigint, active_popups bigint)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  total_users := (SELECT COUNT(DISTINCT id) FROM auth.users);
  total_orders := (
    COALESCE((SELECT COUNT(*) FROM public.website_orders), 0)
    + COALESCE((SELECT COUNT(*) FROM public.orders), 0)
    + COALESCE((SELECT COUNT(*) FROM public.upgrade_orders), 0)
  );
  total_revenue := (
    COALESCE((SELECT SUM(amount) FROM public.website_orders), 0)
    + COALESCE((SELECT SUM(total) FROM public.orders), 0)
    + COALESCE((SELECT SUM(amount) FROM public.upgrade_orders), 0)
  );
  total_templates := (SELECT COUNT(*) FROM public.templates);
  total_plans := (SELECT COUNT(*) FROM public.plans);
  active_popups := 0;
  RETURN NEXT;
END;
$function$;