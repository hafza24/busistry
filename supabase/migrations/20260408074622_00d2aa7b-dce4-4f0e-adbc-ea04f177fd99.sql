
-- Fix 1: Tighten store-assets storage policies with ownership checks
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Store owners can upload assets" ON storage.objects;
DROP POLICY IF EXISTS "Store owners can update own assets" ON storage.objects;
DROP POLICY IF EXISTS "Store owners can delete own assets" ON storage.objects;

-- Upload: store owners can upload to their store folder, or users to logos/{uid}
CREATE POLICY "Authenticated users can upload own assets"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'store-assets' AND (
    -- Store owners: path starts with their store id
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.stores WHERE user_id = auth.uid()
    )
    OR
    -- Users uploading logos for website orders
    ((storage.foldername(name))[1] = 'logos' AND (storage.foldername(name))[2] = auth.uid()::text)
    OR
    -- Admins can upload anywhere (e.g. templates/)
    public.has_role(auth.uid(), 'admin')
  )
);

-- Update: same ownership logic
CREATE POLICY "Authenticated users can update own assets"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'store-assets' AND (
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.stores WHERE user_id = auth.uid()
    )
    OR
    ((storage.foldername(name))[1] = 'logos' AND (storage.foldername(name))[2] = auth.uid()::text)
    OR
    public.has_role(auth.uid(), 'admin')
  )
);

-- Delete: same ownership logic
CREATE POLICY "Authenticated users can delete own assets"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'store-assets' AND (
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.stores WHERE user_id = auth.uid()
    )
    OR
    ((storage.foldername(name))[1] = 'logos' AND (storage.foldername(name))[2] = auth.uid()::text)
    OR
    public.has_role(auth.uid(), 'admin')
  )
);

-- Fix 2: Prevent order_items injection by only allowing inserts within 5 minutes of order creation
CREATE OR REPLACE FUNCTION public.validate_order_item_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow inserting items into orders created within the last 5 minutes
  IF NOT EXISTS (
    SELECT 1 FROM public.orders
    WHERE id = NEW.order_id
    AND created_at > now() - interval '5 minutes'
  ) THEN
    RAISE EXCEPTION 'Cannot add items to this order';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_order_item_insert_trigger
BEFORE INSERT ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION public.validate_order_item_insert();
