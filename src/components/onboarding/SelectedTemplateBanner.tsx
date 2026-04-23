import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Pencil, ImageIcon } from "lucide-react";

interface Props {
  templateId?: string | null;
}

const SelectedTemplateBanner = ({ templateId }: Props) => {
  const { data: template } = useQuery({
    queryKey: ["selected_template", templateId],
    enabled: !!templateId,
    queryFn: async () => {
      const { data } = await supabase
        .from("templates")
        .select("id, name, niche, preview_image_url")
        .eq("id", templateId!)
        .maybeSingle();
      return data;
    },
  });

  if (!templateId) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-secondary/30 p-4 flex items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          No template selected — you can browse templates first.
        </div>
        <Button size="sm" variant="outline" asChild>
          <Link to="/templates">Browse templates</Link>
        </Button>
      </div>
    );
  }

  if (!template) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-3 flex items-center gap-3">
      <div className="h-14 w-20 rounded-lg overflow-hidden bg-muted flex items-center justify-center shrink-0">
        {template.preview_image_url ? (
          <img src={template.preview_image_url} alt={template.name} className="h-full w-full object-cover" />
        ) : (
          <ImageIcon className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Selected template</div>
        <div className="font-semibold text-foreground truncate">{template.name}</div>
        <Badge variant="secondary" className="mt-0.5 text-[10px]">{template.niche}</Badge>
      </div>
      <Button size="sm" variant="ghost" asChild className="shrink-0">
        <Link to="/templates">
          <Pencil className="h-3.5 w-3.5 mr-1" /> Change
        </Link>
      </Button>
    </div>
  );
};

export default SelectedTemplateBanner;
