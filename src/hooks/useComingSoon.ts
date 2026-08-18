import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export const COMING_SOON_KEY = ["site_settings", "coming_soon"];

export const useComingSoon = () => {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: COMING_SOON_KEY,
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("coming_soon_enabled")
        .eq("id", true)
        .maybeSingle();
      if (error) throw error;
      return !!data?.coming_soon_enabled;
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("site_settings_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "site_settings" },
        () => {
          qc.invalidateQueries({ queryKey: COMING_SOON_KEY });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  return query;
};
