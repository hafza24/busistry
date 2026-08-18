-- Invoice System Tables and Security
CREATE TABLE public.invoices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number text UNIQUE NOT NULL,
    customer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_name text NOT NULL,
    customer_email text,
    customer_phone text,
    customer_address text,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
    issue_date date NOT NULL DEFAULT CURRENT_DATE,
    due_date date,
    total_amount numeric NOT NULL DEFAULT 0,
    currency text NOT NULL DEFAULT 'PKR',
    notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.invoice_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id uuid REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
    description text NOT NULL,
    quantity integer NOT NULL DEFAULT 1,
    unit_price numeric NOT NULL DEFAULT 0,
    amount numeric NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoices TO authenticated;
GRANT ALL ON public.invoices TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoice_items TO authenticated;
GRANT ALL ON public.invoice_items TO service_role;

-- Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can do everything on invoices"
ON public.invoices
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can do everything on invoice items"
ON public.invoice_items
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow customers to view their own invoices (if customer_id matches)
CREATE POLICY "Users can view their own invoices"
ON public.invoices
FOR SELECT
TO authenticated
USING (auth.uid() = customer_id);

CREATE POLICY "Users can view their own invoice items"
ON public.invoice_items
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.invoices
        WHERE public.invoices.id = public.invoice_items.invoice_id
        AND public.invoices.customer_id = auth.uid()
    )
);

-- Triggers for updated_at
CREATE TRIGGER set_invoices_updated_at
BEFORE UPDATE ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Function to handle logo/signature or other sensitive invoice ops if needed later
-- For now we handle PDF generation on client side with CEO signature.
