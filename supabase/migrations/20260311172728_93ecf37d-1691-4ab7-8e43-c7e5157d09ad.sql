
-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create store_status enum
CREATE TYPE public.store_status AS ENUM ('pending', 'under_review', 'approved', 'rejected', 'activated', 'suspended', 'expired');

-- Create plan_type enum
CREATE TYPE public.plan_type AS ENUM ('free', 'rent', 'buy');

-- Create payment_method enum
CREATE TYPE public.payment_method AS ENUM ('easypaisa', 'jazzcash', 'nayapay', 'raast', 'bank_transfer');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Templates table
CREATE TABLE public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  niche TEXT NOT NULL,
  description TEXT,
  preview_image_url TEXT,
  demo_url TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  available_plans JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- Plans table
CREATE TABLE public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type plan_type NOT NULL,
  price_pkr INTEGER NOT NULL DEFAULT 0,
  max_products INTEGER NOT NULL DEFAULT 10,
  max_categories INTEGER NOT NULL DEFAULT 5,
  duration_days INTEGER,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- Store requests table
CREATE TABLE public.store_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  store_name TEXT NOT NULL,
  template_id UUID REFERENCES public.templates(id) NOT NULL,
  plan_id UUID REFERENCES public.plans(id) NOT NULL,
  status store_status NOT NULL DEFAULT 'pending',
  payment_method payment_method,
  transaction_id TEXT,
  amount INTEGER,
  screenshot_url TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.store_requests ENABLE ROW LEVEL SECURITY;

-- Stores table
CREATE TABLE public.stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  subdomain_slug TEXT UNIQUE NOT NULL,
  template_id UUID REFERENCES public.templates(id) NOT NULL,
  plan_id UUID REFERENCES public.plans(id) NOT NULL,
  status store_status NOT NULL DEFAULT 'pending',
  activated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  product_count INTEGER NOT NULL DEFAULT 0,
  category_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

-- Product packs table
CREATE TABLE public.product_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  niche TEXT NOT NULL,
  product_count INTEGER NOT NULL DEFAULT 0,
  price_pkr INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.product_packs ENABLE ROW LEVEL SECURITY;

-- Learning articles table
CREATE TABLE public.learning_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  category TEXT NOT NULL,
  video_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.learning_articles ENABLE ROW LEVEL SECURITY;

-- Auto-create profile on signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies

-- Profiles: users read/update own, admins read all
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- User roles: users can read own role
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Templates: public read, admin manage
CREATE POLICY "Anyone can view active templates" ON public.templates FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage templates" ON public.templates FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Plans: public read, admin manage
CREATE POLICY "Anyone can view active plans" ON public.plans FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage plans" ON public.plans FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Store requests: user sees own, admin sees all
CREATE POLICY "Users can view own requests" ON public.store_requests FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create requests" ON public.store_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage requests" ON public.store_requests FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Stores: user sees own, admin sees all
CREATE POLICY "Users can view own stores" ON public.stores FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage stores" ON public.stores FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Product packs: public read, admin manage
CREATE POLICY "Anyone can view active packs" ON public.product_packs FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage packs" ON public.product_packs FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Learning articles: public read published, admin manage
CREATE POLICY "Anyone can view published articles" ON public.learning_articles FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage articles" ON public.learning_articles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Storage bucket for payment screenshots
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-screenshots', 'payment-screenshots', false);

CREATE POLICY "Users can upload screenshots" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'payment-screenshots' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can view own screenshots" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'payment-screenshots' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Admins can view all screenshots" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'payment-screenshots' AND public.has_role(auth.uid(), 'admin'));
