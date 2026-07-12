import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useSubmitReview, ReviewTargetType } from "@/hooks/useReviews";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  targetType: ReviewTargetType;
  targetId: string;
  label: string;
  onSubmitted?: () => void;
}

export default function ReviewDialog({ open, onOpenChange, targetType, targetId, label, onSubmitted }: Props) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const submit = useSubmitReview();
  const { toast } = useToast();

  const reset = () => { setRating(0); setHover(0); setTitle(""); setComment(""); };

  const save = async () => {
    if (rating < 1) { toast({ title: "Pick a rating", variant: "destructive" }); return; }
    if (title.length > 120 || comment.length > 2000) { toast({ title: "Text too long", variant: "destructive" }); return; }
    try {
      await submit.mutateAsync({ target_type: targetType, target_id: targetId, rating, title: title.trim() || undefined, comment: comment.trim() || undefined });
      toast({ title: "Thanks for your review!" });
      reset();
      onOpenChange(false);
      onSubmitted?.();
    } catch (e: any) {
      toast({ title: "Could not submit", description: e.message, variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Review {label}</DialogTitle>
          <DialogDescription>Share your experience — it helps other business owners choose.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Your rating</Label>
            <div className="flex gap-1 mt-2" onMouseLeave={() => setHover(0)}>
              {[1,2,3,4,5].map((n) => (
                <button key={n} type="button" onClick={() => setRating(n)} onMouseEnter={() => setHover(n)} className="p-1">
                  <Star className={cn("h-7 w-7 transition-colors", (hover || rating) >= n ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/40")} />
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <Label>Headline (optional)</Label>
            <Input value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} placeholder="Sums up your experience" />
          </div>
          <div className="space-y-1">
            <Label>Details (optional)</Label>
            <Textarea value={comment} maxLength={2000} rows={4} onChange={(e) => setComment(e.target.value)} placeholder="What worked well? Anything we should improve?" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={submit.isPending}>Submit review</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
