import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useTemplate = (templateId?: string | null) =>
  useQuery({
    queryKey: ["template", templateId],
    queryFn: async () => {
      if (!templateId) return null;
      const { data, error } = await supabase
        .from("templates")
        .select("*")
        .eq("id", templateId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!templateId,
  });
