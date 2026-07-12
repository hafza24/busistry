CREATE OR REPLACE FUNCTION public.get_pending_review_prompts()
RETURNS TABLE(target_type text, target_id uuid, label text, order_id uuid)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH me AS (SELECT auth.uid() AS uid)
  SELECT * FROM (
    SELECT 'order'::text AS target_type, wo.id AS target_id,
           COALESCE(wo.store_name, 'Your website build') AS label,
           wo.id AS order_id
    FROM public.website_orders wo, me
    WHERE wo.user_id = me.uid AND wo.status IN ('delivered','completed')
    UNION ALL
    SELECT 'template', wo.template_id, t.name, wo.id
    FROM public.website_orders wo JOIN public.templates t ON t.id = wo.template_id, me
    WHERE wo.user_id = me.uid AND wo.status IN ('delivered','completed') AND wo.template_id IS NOT NULL
    UNION ALL
    SELECT 'plan', wo.plan_id, p.name, wo.id
    FROM public.website_orders wo JOIN public.plans p ON p.id = wo.plan_id, me
    WHERE wo.user_id = me.uid AND wo.status IN ('delivered','completed') AND wo.plan_id IS NOT NULL
    UNION ALL
    SELECT 'website_product', sa.item_id,
           COALESCE(wp.name, 'Add-on'), NULL::uuid
    FROM public.store_addons sa
    LEFT JOIN public.website_products wp ON wp.id = sa.item_id, me
    WHERE sa.user_id = me.uid AND sa.status IN ('active','delivered','completed','paid')
      AND sa.item_id IS NOT NULL
  ) items
  WHERE NOT EXISTS (
    SELECT 1 FROM public.reviews rv
    WHERE rv.user_id = auth.uid() AND rv.target_type = items.target_type AND rv.target_id = items.target_id
  )
  AND NOT EXISTS (
    SELECT 1 FROM public.review_prompt_state ps
    WHERE ps.user_id = auth.uid()
      AND ps.target_type = items.target_type
      AND ps.target_id = items.target_id
      AND (
        ps.state = 'never'
        OR ps.state = 'reviewed'
        OR (ps.state = 'later' AND ps.last_prompted_at IS NOT NULL AND ps.last_prompted_at > now() - interval '7 days')
      )
  );
$$;