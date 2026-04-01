
-- Create website_orders table
CREATE TABLE public.website_orders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  template_id uuid NOT NULL,
  plan_id uuid NOT NULL,
  store_name text NOT NULL,
  domain_preference text,
  contact_phone text NOT NULL,
  contact_email text,
  address text NOT NULL,
  business_description text,
  logo_url text,
  social_media_links jsonb DEFAULT '{}',
  color_preferences text,
  additional_notes text,
  payment_method text,
  amount integer DEFAULT 0,
  transaction_id text,
  screenshot_url text,
  status text NOT NULL DEFAULT 'pending',
  wordpress_url text,
  wordpress_username text,
  wordpress_password text,
  admin_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.website_orders ENABLE ROW LEVEL SECURITY;

-- Users can create their own orders
CREATE POLICY "Users can create own website orders"
ON public.website_orders
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can view their own orders
CREATE POLICY "Users can view own website orders"
ON public.website_orders
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can manage all orders
CREATE POLICY "Admins can manage all website orders"
ON public.website_orders
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
