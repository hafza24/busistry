import { useState } from "react";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, MessageSquarePlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const feedbackSchema = z.object({
  rating: z.number().int().min(1, "Please select a rating").max(5),
  subject: z.string().trim().min(3, "Subject is too short").max(120, "Subject is too long"),
  message: z.string().trim().min(10, "Please share a bit more (min 10 chars)").max(1000, "Message is too long"),
  category: z.enum(["review", "bug", "feature", "question", "other"]),
  allow_contact: z.boolean(),
});

interface FeedbackDialogProps {
  trigger?: React.ReactNode;
  defaultCategory?: "review" | "bug" | "feature" | "question" | "other";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const FeedbackDialog = ({ trigger, defaultCategory = "review", open, onOpenChange }: FeedbackDialogProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const dialogOpen = isControlled ? open : internalOpen;
  const setDialogOpen = (v: boolean) => {
    if (!isControlled) setInternalOpen(v);
    onOpenChange?.(v);
  };

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState<"review" | "bug" | "feature" | "question" | "other">(defaultCategory);
  const [allowContact, setAllowContact] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setRating(0); setHover(0); setSubject(""); setMessage("");
    setCategory(defaultCategory); setAllowContact(true);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please sign in to leave feedback");
      setDialogOpen(false);
      navigate("/auth");
      return;
    }
    const parsed = feedbackSchema.safeParse({ rating, subject, message, category, allow_contact: allowContact });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check your input");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("feedback_submissions").insert({
        user_id: user.id,
        rating: parsed.data.rating,
        subject: parsed.data.subject,
        message: parsed.data.message,
        category: parsed.data.category,
        email: user.email ?? null,
        allow_contact: parsed.data.allow_contact,
      });
      if (error) throw error;
      toast.success("Thanks for your feedback!", { description: "We review every submission before publishing." });
      reset();
      setDialogOpen(false);
    } catch (e: any) {
      toast.error(e.message ?? "Could not submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share your feedback</DialogTitle>
          <DialogDescription>Tell us what's working, what isn't, or leave a review. Approved reviews may be featured on our site.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="mb-2 block">Rating</Label>
            <div className="flex gap-1" role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((n) => {
                const active = (hover || rating) >= n;
                return (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={rating === n}
                    aria-label={`${n} star${n > 1 ? "s" : ""}`}
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(n)}
                    className="p-1 rounded hover:scale-110 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Star className={cn("h-7 w-7", active ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground")} aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <Label htmlFor="fb-category">Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as any)}>
              <SelectTrigger id="fb-category"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="review">Review / testimonial</SelectItem>
                <SelectItem value="bug">Bug report</SelectItem>
                <SelectItem value="feature">Feature request</SelectItem>
                <SelectItem value="question">Question</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="fb-subject">Subject</Label>
            <Input id="fb-subject" value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={120} placeholder="Brief summary" />
          </div>

          <div>
            <Label htmlFor="fb-message">Message</Label>
            <Textarea id="fb-message" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={1000} rows={4} placeholder="Share your experience..." />
            <p className="text-xs text-muted-foreground mt-1">{message.length}/1000</p>
          </div>

          <label className="flex items-start gap-2 text-sm text-muted-foreground cursor-pointer">
            <input type="checkbox" checked={allowContact} onChange={(e) => setAllowContact(e.target.checked)} className="mt-1" />
            <span>It's OK to contact me about this feedback</span>
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting</> : <><MessageSquarePlus className="h-4 w-4 mr-2" />Submit</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackDialog;
