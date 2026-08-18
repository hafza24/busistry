-- (1) Revoke EXECUTE from PUBLIC for the remaining SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.create_order_with_items(uuid, text, text, text, text, text, numeric, numeric, jsonb) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.lookup_order_items(text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_feedback_rating_distribution() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.lookup_order_status(text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.can_review(uuid, text, uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_pending_review_prompts() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.apply_upgrade_order(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.apply_catalog_order(uuid) FROM PUBLIC;

-- (2) Grant EXECUTE selectively
-- Orders can be created/looked up by authenticated users (storefront)
GRANT EXECUTE ON FUNCTION public.create_order_with_items(uuid, text, text, text, text, text, numeric, numeric, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.lookup_order_items(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.lookup_order_status(text, text) TO authenticated;

-- Rating distribution is public
GRANT EXECUTE ON FUNCTION public.get_feedback_rating_distribution() TO authenticated, anon;

-- Review logic
GRANT EXECUTE ON FUNCTION public.can_review(uuid, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_pending_review_prompts() TO authenticated;

-- Order fulfillment (usually by service_role or admin)
GRANT EXECUTE ON FUNCTION public.apply_upgrade_order(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.apply_catalog_order(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.apply_upgrade_order(uuid) TO authenticated; -- if frontend calls it directly
GRANT EXECUTE ON FUNCTION public.apply_catalog_order(uuid) TO authenticated;
