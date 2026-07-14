import { useState, useMemo, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { UserCog, AlertCircle } from "lucide-react";

const FIELDS = [
  "full_name", "phone", "avatar_url", "bio", "gender", "date_of_birth",
  "business_name", "website_url", "address_line", "city", "province",
  "postal_code", "country", "whatsapp", "facebook_url", "instagram_url",
  "twitter_url", "linkedin_url",
] as const;

const REQUIRED_PERCENT = 60;

export function useProfileCompleteness() {
  const { user } = useAuth();
  const query = useQuery({
    queryKey: ["profile_completeness", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(FIELDS.join(","))
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data as Record<string, any> | null;
    },
  });

  const { percent, filled, total } = useMemo(() => {
    const p = query.data;
    if (!p) return { percent: 0, filled: 0, total: FIELDS.length };
    const f = FIELDS.reduce((n, k) => n + (String(p[k] ?? "").trim() ? 1 : 0), 0);
    return { percent: Math.round((f / FIELDS.length) * 100), filled: f, total: FIELDS.length };
  }, [query.data]);

  return { percent, filled, total, required: REQUIRED_PERCENT, isComplete: percent >= REQUIRED_PERCENT, isLoading: query.isLoading };
}

export function useProfileGate() {
  const [open, setOpen] = useState(false);
  const { percent, required, isComplete, isLoading } = useProfileCompleteness();

  const requireComplete = (): boolean => {
    if (isLoading) return false;
    if (isComplete) return true;
    setOpen(true);
    return false;
  };

  const dialog: ReactNode = (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mx-auto h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-2">
            <AlertCircle className="h-6 w-6 text-amber-600" />
          </div>
          <DialogTitle className="text-center">Complete your profile to continue</DialogTitle>
          <DialogDescription className="text-center">
            You need at least {required}% of your profile filled before placing an order. This helps us
            deliver, contact you, and process payments correctly.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Current progress</span>
            <span className="font-medium">{percent}%</span>
          </div>
          <Progress value={percent} />
          <p className="text-xs text-muted-foreground text-center">
            You need {Math.max(required - percent, 0)}% more to unlock ordering.
          </p>
        </div>

        <DialogFooter className="sm:justify-center gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Not now</Button>
          <Button asChild onClick={() => setOpen(false)}>
            <Link to="/dashboard?view=profile">
              <UserCog className="h-4 w-4 mr-2" /> Go to profile
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return { requireComplete, dialog, percent, required, isComplete };
}
