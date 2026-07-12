CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  target_type text NOT NULL CHECK (target_type IN ('template','plan','order','website_product')),
  target_id uuid NOT NULL,
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title text,
  comment text,
  is_approved boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, target_type, target_id)
);
CREATE INDEX idx_reviews_target ON public.reviews (target_type, target_id) WHERE is_approved;
CREATE INDEX idx_reviews_user ON public.reviews (user_id);

GRANT SELECT ON public.reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved reviews" ON public.reviews FOR SELECT USING (is_approved = true OR user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.can_review(_user_id uuid, _target_type text, _target_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT CASE _target_type
    WHEN 'order' THEN EXISTS (
      SELECT 1 FROM public.website_orders wo
      WHERE wo.id = _target_id AND wo.user_id = _user_id AND wo.status IN ('delivered','completed','paid')
    )
    WHEN 'template' THEN EXISTS (
      SELECT 1 FROM public.website_orders wo
      WHERE wo.template_id = _target_id AND wo.user_id = _user_id AND wo.status IN ('delivered','completed','paid')
    )
    WHEN 'plan' THEN EXISTS (
      SELECT 1 FROM public.website_orders wo
      WHERE wo.plan_id = _target_id AND wo.user_id = _user_id AND wo.status IN ('delivered','completed','paid')
    )
    WHEN 'website_product' THEN EXISTS (
      SELECT 1 FROM public.store_addons sa
      WHERE sa.user_id = _user_id AND sa.status IN ('active','delivered','completed','paid')
        AND sa.item_id = _target_id
    )
    ELSE false
  END;
$$;

CREATE POLICY "Users can create verified reviews" ON public.reviews FOR INSERT WITH CHECK (
  user_id = auth.uid() AND public.can_review(auth.uid(), target_type, target_id)
);
CREATE POLICY "Users can update own review" ON public.reviews FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own review" ON public.reviews FOR DELETE USING (user_id = auth.uid());
CREATE POLICY "Admins manage reviews" ON public.reviews FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.review_prompt_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  target_type text NOT NULL,
  target_id uuid NOT NULL,
  state text NOT NULL DEFAULT 'pending' CHECK (state IN ('pending','later','never','reviewed')),
  last_prompted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, target_type, target_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.review_prompt_state TO authenticated;
GRANT ALL ON public.review_prompt_state TO service_role;
ALTER TABLE public.review_prompt_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own prompt state" ON public.review_prompt_state FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE TRIGGER trg_prompt_updated_at BEFORE UPDATE ON public.review_prompt_state FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.on_review_created()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.review_prompt_state (user_id, target_type, target_id, state)
  VALUES (NEW.user_id, NEW.target_type, NEW.target_id, 'reviewed')
  ON CONFLICT (user_id, target_type, target_id)
  DO UPDATE SET state = 'reviewed', updated_at = now();
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_review_prompt_sync AFTER INSERT ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.on_review_created();

CREATE OR REPLACE VIEW public.item_review_stats AS
WITH r AS (
  SELECT target_type, target_id,
         ROUND(AVG(rating)::numeric, 2) AS avg_rating,
         COUNT(*)::int AS review_count,
         COUNT(*) FILTER (WHERE rating >= 4)::int AS positive_count
  FROM public.reviews WHERE is_approved = true
  GROUP BY target_type, target_id
),
sales AS (
  SELECT 'template'::text AS target_type, template_id AS target_id, COUNT(*)::int AS sales_count
    FROM public.website_orders WHERE template_id IS NOT NULL AND status IN ('delivered','completed','paid')
    GROUP BY template_id
  UNION ALL
  SELECT 'plan', plan_id, COUNT(*)::int
    FROM public.website_orders WHERE plan_id IS NOT NULL AND status IN ('delivered','completed','paid')
    GROUP BY plan_id
  UNION ALL
  SELECT 'website_product', sa.item_id, COUNT(*)::int
    FROM public.store_addons sa
    WHERE sa.item_id IS NOT NULL AND sa.status IN ('active','delivered','completed','paid')
    GROUP BY sa.item_id
),
combined AS (
  SELECT COALESCE(r.target_type, s.target_type) AS target_type,
         COALESCE(r.target_id, s.target_id) AS target_id,
         COALESCE(r.avg_rating, 0) AS avg_rating,
         COALESCE(r.review_count, 0) AS review_count,
         COALESCE(r.positive_count, 0) AS positive_count,
         COALESCE(s.sales_count, 0) AS sales_count
  FROM r FULL OUTER JOIN sales s ON r.target_type = s.target_type AND r.target_id = s.target_id
)
SELECT c.*,
  (c.avg_rating >= 4.5 AND c.review_count >= 3) AS is_top,
  (c.sales_count > 0 AND c.sales_count >= COALESCE((SELECT PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY sales_count) FROM combined c2 WHERE c2.target_type = c.target_type AND c2.sales_count > 0), 0)) AS is_popular,
  (c.positive_count >= 5 AND c.avg_rating >= 4.3) AS is_liked,
  (c.avg_rating >= 4.5 AND c.review_count >= 3 AND c.sales_count > 0) AS is_featured
FROM combined c;

GRANT SELECT ON public.item_review_stats TO anon, authenticated;

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
    WHERE ps.user_id = auth.uid() AND ps.target_type = items.target_type AND ps.target_id = items.target_id
      AND ps.state = 'never'
  );
$$;
GRANT EXECUTE ON FUNCTION public.get_pending_review_prompts() TO authenticated;