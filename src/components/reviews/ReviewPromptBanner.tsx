import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MessageSquarePlus, Clock, X } from "lucide-react";
import { usePendingReviewPrompts, useSetPromptState, ReviewTargetType } from "@/hooks/useReviews";
import ReviewDialog from "./ReviewDialog";

const TYPE_LABEL: Record<ReviewTargetType, string> = {
  order: "Website build",
  template: "Template",
  plan: "Plan",
  website_product: "Add-on",
};

export default function ReviewPromptBanner() {
  const { data: prompts = [], isLoading } = usePendingReviewPrompts();
  const setState = useSetPromptState();
  const [active, setActive] = useState<{ target_type: ReviewTargetType; target_id: string; label: string } | null>(null);

  if (isLoading || prompts.length === 0) return null;

  return (
    <>
      <Card className="mb-6 border-primary/40 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <h3 className="font-semibold">How was your experience?</h3>
            <Badge variant="secondary" className="ml-2 text-[10px]">{prompts.length} pending</Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            You purchased the items below. A quick rating helps other business owners choose.
          </p>
          <div className="space-y-2">
            {prompts.slice(0, 4).map((p) => (
              <div key={`${p.target_type}-${p.target_id}`} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border/60 bg-card/60">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">{TYPE_LABEL[p.target_type]}</Badge>
                    <p className="text-sm font-medium truncate">{p.label}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button size="sm" onClick={() => setActive({ target_type: p.target_type, target_id: p.target_id, label: p.label })}>
                    <MessageSquarePlus className="h-3.5 w-3.5 mr-1" /> Review
                  </Button>
                  <Button size="sm" variant="ghost" title="Ask me later"
                    onClick={() => setState.mutate({ target_type: p.target_type, target_id: p.target_id, state: "later" })}>
                    <Clock className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" title="Never ask again"
                    onClick={() => setState.mutate({ target_type: p.target_type, target_id: p.target_id, state: "never" })}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {active && (
        <ReviewDialog
          open={!!active}
          onOpenChange={(v) => !v && setActive(null)}
          targetType={active.target_type}
          targetId={active.target_id}
          label={active.label}
        />
      )}
    </>
  );
}
