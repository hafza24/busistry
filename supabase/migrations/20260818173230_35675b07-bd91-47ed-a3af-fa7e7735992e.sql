
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invoice_type') THEN
        CREATE TYPE public.invoice_type AS ENUM ('manual', 'order');
    END IF;
    -- invoice_status already exists as per previous error
END $$;

-- Update invoices table with requested fields
ALTER TABLE public.invoices 
  ADD COLUMN IF NOT EXISTS invoice_type public.invoice_type DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS order_id uuid REFERENCES public.website_orders(id),
  ADD COLUMN IF NOT EXISTS company_name text,
  ADD COLUMN IF NOT EXISTS tax_number text,
  ADD COLUMN IF NOT EXISTS discount_total numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tax_total numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS shipping_total numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS amount_paid numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS amount_due numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);

-- Update invoice_items table with requested fields
ALTER TABLE public.invoice_items
  ADD COLUMN IF NOT EXISTS product_id uuid,
  ADD COLUMN IF NOT EXISTS item_name text,
  ADD COLUMN IF NOT EXISTS tax_rate numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tax_amount numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS line_total numeric DEFAULT 0;

-- Grants
GRANT ALL ON public.invoices TO authenticated;
GRANT ALL ON public.invoices TO service_role;
GRANT ALL ON public.invoice_items TO authenticated;
GRANT ALL ON public.invoice_items TO service_role;

-- RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- Drop existing if exists to avoid collision
DROP POLICY IF EXISTS "Admins can do everything with invoices" ON public.invoices;
CREATE POLICY "Admins can do everything with invoices" ON public.invoices
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can do everything with invoice items" ON public.invoice_items;
CREATE POLICY "Admins can do everything with invoice items" ON public.invoice_items
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
