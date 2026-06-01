-- Lock down website_orders INSERT so users cannot self-approve via status field
DROP POLICY IF EXISTS "Users can create own website orders" ON public.website_orders;
CREATE POLICY "Users can create own website orders"
ON public.website_orders
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Lock down store_addons UPDATE so users cannot self-approve; only allow editing while pending and cannot change status
DROP POLICY IF EXISTS "Owners update own store addons" ON public.store_addons;
CREATE POLICY "Owners update own store addons"
ON public.store_addons
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND status = 'pending')
WITH CHECK (auth.uid() = user_id AND status = 'pending');