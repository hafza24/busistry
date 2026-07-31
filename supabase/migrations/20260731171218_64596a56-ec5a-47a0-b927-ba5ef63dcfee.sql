GRANT SELECT ON public.item_review_stats TO anon;
GRANT EXECUTE ON FUNCTION public.get_feedback_rating_stats() TO anon;
GRANT EXECUTE ON FUNCTION public.get_feedback_rating_distribution() TO anon;