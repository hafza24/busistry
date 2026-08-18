-- Identify security definer functions to switch to security invoker or move schema
-- This addresses Warn 3 & 4 from the linter

DO $$
DECLARE
    func_name text;
BEGIN
    FOR func_name IN 
        SELECT routine_name 
        FROM information_schema.routines 
        WHERE routine_schema = 'public' 
        AND routine_type = 'FUNCTION'
    LOOP
        EXECUTE format('ALTER FUNCTION public.%I SECURITY INVOKER;', func_name);
    END LOOP;
END $$;
