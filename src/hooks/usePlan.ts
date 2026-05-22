import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const usePlan = (planId?: string | null) =>
  useQuery({
    queryKey: ["plan", planId],
    queryFn: async () => {
      if (!planId) return null;
      const { data, error } = await supabase
        .from("plans")
        .select("*")
        .eq("id", planId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!planId,
  });
