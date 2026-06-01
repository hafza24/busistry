DROP POLICY IF EXISTS "Public can view settings of activated stores (safe cols only vi" ON public.store_settings;
DROP POLICY IF EXISTS "Public can view settings of activated stores" ON public.store_settings;

DROP POLICY IF EXISTS "Public can view active categories" ON public.categories;
CREATE POLICY "Public can view active categories"
ON public.categories
FOR SELECT
TO anon, authenticated
USING (
  is_active = true
  AND EXISTS (
    SELECT 1 FROM public.stores s
    WHERE s.id = categories.store_id
      AND s.status = 'activated'
  )
);

DROP POLICY IF EXISTS "Public can view active products" ON public.products;
CREATE POLICY "Public can view active products"
ON public.products
FOR SELECT
TO anon, authenticated
USING (
  is_active = true
  AND EXISTS (
    SELECT 1 FROM public.stores s
    WHERE s.id = products.store_id
      AND s.status = 'activated'
  )
);