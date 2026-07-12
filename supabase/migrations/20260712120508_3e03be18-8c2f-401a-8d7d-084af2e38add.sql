
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS tracking_number text,
  ADD COLUMN IF NOT EXISTS tracking_carrier text,
  ADD COLUMN IF NOT EXISTS tracking_url text,
  ADD COLUMN IF NOT EXISTS shipped_at timestamptz;

DROP FUNCTION IF EXISTS public.lookup_order_status(text, text);

CREATE FUNCTION public.lookup_order_status(p_order_number text, p_email text)
RETURNS TABLE(
  order_number text,
  status text,
  customer_name text,
  total numeric,
  shipping_fee numeric,
  created_at timestamptz,
  updated_at timestamptz,
  shipped_at timestamptz,
  tracking_number text,
  tracking_carrier text,
  tracking_url text,
  store_name text,
  store_slug text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    o.order_number,
    o.status,
    o.customer_name,
    o.total,
    o.shipping_fee,
    o.created_at,
    o.updated_at,
    o.shipped_at,
    o.tracking_number,
    o.tracking_carrier,
    o.tracking_url,
    s.name AS store_name,
    s.subdomain_slug AS store_slug
  FROM public.orders o
  JOIN public.stores s ON s.id = o.store_id
  WHERE lower(o.order_number) = lower(trim(p_order_number))
    AND lower(coalesce(o.customer_email, '')) = lower(trim(p_email))
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.lookup_order_status(text, text) TO anon, authenticated;
