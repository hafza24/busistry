-- Enable Realtime for site_settings if not already enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'site_settings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.site_settings;
  END IF;
END
$$;

-- Ensure site_settings exists and has required columns if it doesn't
CREATE TABLE IF NOT EXISTS public.site_settings (
    id boolean PRIMARY KEY DEFAULT true,
    coming_soon_enabled boolean DEFAULT false,
    updated_at timestamptz DEFAULT now(),
    updated_by uuid REFERENCES auth.users(id),
    CONSTRAINT one_row CHECK (id)
);

-- Ensure RLS is enabled
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Grants
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT ALL ON public.site_settings TO service_role;
GRANT UPDATE ON public.site_settings TO authenticated;

-- Policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_settings' AND policyname = 'Admins can update site settings') THEN
        CREATE POLICY "Admins can update site settings"
        ON public.site_settings
        FOR UPDATE
        TO authenticated
        USING (public.has_role(auth.uid(), 'admin'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_settings' AND policyname = 'Anyone can view site settings') THEN
        CREATE POLICY "Anyone can view site settings"
        ON public.site_settings
        FOR SELECT
        TO anon, authenticated
        USING (true);
    END IF;
END
$$;

-- Insert default row if missing
INSERT INTO public.site_settings (id, coming_soon_enabled)
VALUES (true, false)
ON CONFLICT (id) DO NOTHING;
