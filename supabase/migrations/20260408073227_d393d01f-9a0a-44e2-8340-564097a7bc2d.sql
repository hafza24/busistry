
-- Fix 1: Tighten public INSERT on orders to validate store_id references an activated store
DROP POLICY IF EXISTS "Public can insert orders" ON public.orders;
CREATE POLICY "Public can insert orders"
ON public.orders
FOR INSERT
TO public
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.stores
    WHERE stores.id = orders.store_id
    AND stores.status = 'activated'
  )
);

-- Fix 2: Tighten public INSERT on order_items to validate order_id references an existing order
DROP POLICY IF EXISTS "Public can insert order items" ON public.order_items;
CREATE POLICY "Public can insert order items"
ON public.order_items
FOR INSERT
TO public
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
  )
);
