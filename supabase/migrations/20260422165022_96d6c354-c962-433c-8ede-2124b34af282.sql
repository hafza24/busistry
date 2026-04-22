-- Revoke direct SELECT access to encrypted WordPress credential columns from authenticated users.
-- Users must go through the manage-credentials edge function (which uses service role) to access them.
-- Admins still have full table access via RLS + service role usage in the edge function.

REVOKE SELECT (wordpress_url, wordpress_username, wordpress_password) ON public.website_orders FROM authenticated;
REVOKE SELECT (wordpress_url, wordpress_username, wordpress_password) ON public.website_orders FROM anon;

-- Also revoke direct UPDATE on these columns so they can only be modified through the edge function
REVOKE UPDATE (wordpress_url, wordpress_username, wordpress_password) ON public.website_orders FROM authenticated;
REVOKE UPDATE (wordpress_url, wordpress_username, wordpress_password) ON public.website_orders FROM anon;