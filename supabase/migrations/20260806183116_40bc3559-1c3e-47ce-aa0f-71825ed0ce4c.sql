DO $$
DECLARE cols text;
BEGIN
  SELECT string_agg(quote_ident(attname), ', ')
  INTO cols
  FROM pg_attribute
  WHERE attrelid = 'public.website_orders'::regclass
    AND attnum > 0 AND NOT attisdropped
    AND attname NOT IN ('wordpress_url','wordpress_username','wordpress_password');

  EXECUTE 'REVOKE SELECT, INSERT, UPDATE ON public.website_orders FROM authenticated';
  EXECUTE 'REVOKE SELECT, INSERT, UPDATE ON public.website_orders FROM anon';
  EXECUTE format('GRANT SELECT (%s) ON public.website_orders TO authenticated', cols);
  EXECUTE format('GRANT INSERT (%s) ON public.website_orders TO authenticated', cols);
  EXECUTE format('GRANT UPDATE (%s) ON public.website_orders TO authenticated', cols);
END $$;

GRANT ALL ON public.website_orders TO service_role;