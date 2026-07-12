import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type ReviewTargetType = "template" | "plan" | "order" | "website_product";

export interface ItemReviewStats {
  target_type: ReviewTargetType;
  target_id: string;
  avg_rating: number;
  review_count: number;
  positive_count: number;
  sales_count: number;
  is_top: boolean;
  is_popular: boolean;
  is_liked: boolean;
  is_featured: boolean;
}

export interface PendingReviewPrompt {
  target_type: ReviewTargetType;
  target_id: string;
  label: string;
  order_id: string | null;
}

// Fetch aggregate stats for a set of items (or all)
export const useItemReviewStats = (targetType?: ReviewTargetType) => {
  return useQuery({
    queryKey: ["item-review-stats", targetType ?? "all"],
    queryFn: async () => {
      let q = supabase.from("item_review_stats" as any).select("*");
      if (targetType) q = q.eq("target_type", targetType);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as ItemReviewStats[];
    },
    staleTime: 60_000,
  });
};

// Reviews list for a specific item
export const useItemReviews = (targetType: ReviewTargetType, targetId?: string) => {
  return useQuery({
    queryKey: ["reviews", targetType, targetId],
    enabled: !!targetId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews" as any)
        .select("id, rating, title, comment, created_at, user_id")
        .eq("target_type", targetType)
        .eq("target_id", targetId!)
        .eq("is_approved", true)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });
};

// Pending review prompts for the logged-in user
export const usePendingReviewPrompts = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["pending-review-prompts", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_pending_review_prompts" as any);
      if (error) throw error;
      return (data ?? []) as unknown as PendingReviewPrompt[];
    },
  });
};

export const useSubmitReview = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: {
      target_type: ReviewTargetType;
      target_id: string;
      rating: number;
      title?: string;
      comment?: string;
    }) => {
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase.from("reviews" as any).upsert(
        { ...input, user_id: user.id },
        { onConflict: "user_id,target_type,target_id" }
      );
      if (error) throw error;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["pending-review-prompts"] });
      qc.invalidateQueries({ queryKey: ["item-review-stats"] });
      qc.invalidateQueries({ queryKey: ["reviews", vars.target_type, vars.target_id] });
    },
  });
};

export const useSetPromptState = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: {
      target_type: ReviewTargetType;
      target_id: string;
      state: "later" | "never" | "reviewed";
    }) => {
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase.from("review_prompt_state" as any).upsert(
        { ...input, user_id: user.id, last_prompted_at: new Date().toISOString() },
        { onConflict: "user_id,target_type,target_id" }
      );
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pending-review-prompts"] }),
  });
};
