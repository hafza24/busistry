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
    retry: 1, // Be resilient to network failures
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("site_settings")
          .select("coming_soon_enabled")
          .eq("id", true)
          .maybeSingle();
        
        if (error) {
          console.error("Error fetching site_settings:", error);
          // If the table doesn't exist or we can't read it, default to false
          return false;
        }
        return !!data?.coming_soon_enabled;
      } catch (err) {
        console.error("Failed to fetch coming soon status:", err);
        return false;
      }
    },
  });

  useEffect(() => {
    let mounted = true;
    
    // Register all callbacks BEFORE subscribe()
    const channel = supabase
      .channel("site_settings_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "site_settings" },
        (payload) => {
          if (!mounted) return;
          console.log("Realtime site_settings change detected:", payload);
          qc.invalidateQueries({ queryKey: COMING_SOON_KEY });
        }
      )
      .subscribe((status, err) => {
        if (err) {
          console.warn("Supabase Realtime subscription error for site_settings:", err);
        }
        if (status === "CHANNEL_ERROR") {
          console.warn("Realtime channel error for site_settings. Realtime updates might be disabled.");
        }
      });

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [qc]);

  return query;
};
