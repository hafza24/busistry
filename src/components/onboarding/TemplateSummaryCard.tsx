import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, LayoutTemplate, Pencil } from "lucide-react";
import { Link } from "react-router-dom";
import { useTemplate } from "@/hooks/useTemplate";
import { getPresetForTemplate } from "@/lib/templatePresets";

interface Props {
  templateId?: string | null;
}

const TemplateSummaryCard = ({ templateId }: Props) => {
  const { data: template, isLoading } = useTemplate(templateId);

  if (!templateId) {
    return (
      <Card className="border-dashed border-border/70 bg-muted/30">
        <CardContent className="py-4 flex items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            No template selected — pick one to auto-configure your pages.
          </div>
          <Button size="sm" variant="outline" asChild>
            <Link to="/templates">Browse templates</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading || !template) {
    return (
      <Card className="border-border/60">
        <CardContent className="py-4 text-sm text-muted-foreground">Loading template…</CardContent>
      </Card>
    );
  }

  const preset = getPresetForTemplate(template);

  return (
    <Card className="border-accent/30 bg-gradient-to-br from-accent/5 via-background to-background overflow-hidden">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            {template.preview_image_url ? (
              <img
                src={template.preview_image_url}
                alt={template.name}
                className="h-12 w-16 rounded-md object-cover border border-border/60 shrink-0"
              />
            ) : (
              <div className="h-12 w-16 rounded-md bg-accent/10 flex items-center justify-center shrink-0">
                <LayoutTemplate className="h-5 w-5 text-accent" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">{template.name}</h3>
                <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">Template</Badge>
              </div>
              <div className="flex gap-1.5 mt-1">
                {template.category && <Badge variant="outline" className="text-[10px]">{template.category}</Badge>}
                {template.subcategory && <Badge variant="outline" className="text-[10px]">{template.subcategory}</Badge>}
              </div>
            </div>
          </div>
          <Button size="sm" variant="ghost" asChild className="text-xs text-muted-foreground hover:text-foreground">
            <Link to="/templates"><Pencil className="h-3 w-3 mr-1.5" /> Change</Link>
          </Button>
        </div>

        {preset.pages.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              <Lock className="h-3 w-3" /> Included pages · Configured by template
            </div>
            <div className="flex flex-wrap gap-1.5">
              {preset.pages.map((p) => (
                <span key={p} className="text-xs px-2 py-1 rounded-md border border-primary/15 bg-primary/5 text-foreground/90">
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}

        {preset.modules.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              <Lock className="h-3 w-3" /> Included modules
            </div>
            <div className="flex flex-wrap gap-1.5">
              {preset.modules.map((m) => (
                <span key={m} className="text-xs px-2 py-1 rounded-md border border-accent/20 bg-accent/5 text-foreground/90">
                  {m}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TemplateSummaryCard;
