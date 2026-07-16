import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type CaseStudy = {
  id: string;
  title: string;
  slug: string;
  tag: string;
  excerpt: string | null;
  content: string | null;
  cover_image_url: string | null;
  customer_name: string | null;
  customer_role: string | null;
  is_published: boolean;
  is_featured: boolean;
  sort_order: number;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string[];
  og_image_url: string | null;
  created_at: string;
  updated_at: string;
};

export const usePublishedCaseStudies = (limit = 6) =>
  useQuery({
    queryKey: ["case-studies", "published", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("case_studies" as any)
        .select("*")
        .eq("is_published", true)
        .order("is_featured", { ascending: false })
        .order("sort_order", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as unknown as CaseStudy[];
    },
  });

export const useAllCaseStudies = () =>
  useQuery({
    queryKey: ["case-studies", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("case_studies" as any)
        .select("*")
        .order("sort_order", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as CaseStudy[];
    },
  });

export const useCaseStudyBySlug = (slug: string | undefined) =>
  useQuery({
    queryKey: ["case-study", slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("case_studies" as any)
        .select("*")
        .eq("slug", slug!)
        .eq("is_published", true)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as CaseStudy | null;
    },
  });

export const useUpsertCaseStudy = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<CaseStudy> & { title: string; slug: string }) => {
      const { data, error } = await supabase
        .from("case_studies" as any)
        .upsert(payload as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["case-studies"] }),
  });
};

export const useDeleteCaseStudy = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("case_studies" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["case-studies"] }),
  });
};
