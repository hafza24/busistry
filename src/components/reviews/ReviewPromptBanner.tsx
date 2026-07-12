import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
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

// Session flag so we only auto-open once per browser session
const SESSION_KEY = "review_prompt_shown";

export default function ReviewPromptBanner() {
  const { data: prompts = [], isLoading } = usePendingReviewPrompts();
  const setState = useSetPromptState();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<{ target_type: ReviewTargetType; target_id: string; label: string } | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (prompts.length === 0) return;
    if (sessionStorage.getItem(SESSION_KEY) === "1") return;
    sessionStorage.setItem(SESSION_KEY, "1");
    setOpen(true);
  }, [isLoading, prompts.length]);

  if (prompts.length === 0) return null;

  const dismissAllLater = () => {
    prompts.forEach((p) =>
      setState.mutate({ target_type: p.target_type, target_id: p.target_id, state: "later" })
    );
    setOpen(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              How was your experience?
              <Badge variant="secondary" className="ml-1 text-[10px]">{prompts.length} pending</Badge>
            </DialogTitle>
            <DialogDescription>
              You purchased the items below. A quick rating helps other business owners choose.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
            {prompts.map((p) => (
              <div key={`${p.target_type}-${p.target_id}`} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border/60 bg-card/60">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
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

          <DialogFooter>
            <Button variant="outline" onClick={dismissAllLater}>Remind me later</Button>
            <Button variant="ghost" onClick={() => setOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
