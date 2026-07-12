
CREATE OR REPLACE FUNCTION public.lookup_order_items(p_order_number text, p_email text)
RETURNS TABLE(
  product_name text,
  quantity integer,
  price numeric,
  total numeric
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT oi.product_name, oi.quantity, oi.price, oi.total
  FROM public.order_items oi
  JOIN public.orders o ON o.id = oi.order_id
  WHERE lower(o.order_number) = lower(trim(p_order_number))
    AND lower(coalesce(o.customer_email, '')) = lower(trim(p_email))
  ORDER BY oi.product_name;
$$;

GRANT EXECUTE ON FUNCTION public.lookup_order_items(text, text) TO anon, authenticated;
