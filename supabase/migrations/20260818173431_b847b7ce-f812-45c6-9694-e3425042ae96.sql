
DO $$ 
BEGIN
    DROP TYPE IF EXISTS public.invoice_status CASCADE;
    CREATE TYPE public.invoice_status AS ENUM ('draft', 'sent', 'paid', 'partially_paid', 'overdue', 'cancelled');
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invoice_type') THEN
        CREATE TYPE public.invoice_type AS ENUM ('manual', 'order');
    END IF;
END $$;

ALTER TABLE public.invoices 
  ADD COLUMN IF NOT EXISTS status public.invoice_status DEFAULT 'draft';

ALTER TABLE public.invoices 
  ADD COLUMN IF NOT EXISTS grand_total numeric DEFAULT 0;

-- Refresh view permissions
GRANT ALL ON public.invoices TO authenticated;
GRANT ALL ON public.invoices TO service_role;
GRANT ALL ON public.invoice_items TO authenticated;
GRANT ALL ON public.invoice_items TO service_role;
