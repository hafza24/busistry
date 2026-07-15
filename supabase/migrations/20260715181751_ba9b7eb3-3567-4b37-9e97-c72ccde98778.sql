CREATE OR REPLACE FUNCTION public.get_feedback_rating_distribution()
 RETURNS TABLE(total_reviews bigint, avg_rating numeric, rating_5 bigint, rating_4 bigint, rating_3 bigint, rating_2 bigint, rating_1 bigint)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  SELECT 
    COUNT(*)::bigint,
    COALESCE(ROUND(AVG(rating)::numeric, 2), 0),
    COUNT(*) FILTER (WHERE rating = 5)::bigint,
    COUNT(*) FILTER (WHERE rating = 4)::bigint,
    COUNT(*) FILTER (WHERE rating = 3)::bigint,
    COUNT(*) FILTER (WHERE rating = 2)::bigint,
    COUNT(*) FILTER (WHERE rating = 1)::bigint
  INTO 
    total_reviews, avg_rating, rating_5, rating_4, rating_3, rating_2, rating_1
  FROM public.feedback_submissions
  WHERE approved = true;
  RETURN NEXT;
END;
$function$;