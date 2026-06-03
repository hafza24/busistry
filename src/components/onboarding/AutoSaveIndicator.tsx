import { Check, Loader2, CloudOff } from "lucide-react";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";

interface Props {
  saving: boolean;
  /** Flips true when a save completes; used to stamp lastSaved. */
  hasDraftId?: boolean;
}

export const AutoSaveIndicator = ({ saving, hasDraftId }: Props) => {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [tick, setTick] = useState(0);

  // When saving flips from true → false, stamp lastSaved
  useEffect(() => {
    if (!saving && hasDraftId) setLastSaved(new Date());
  }, [saving, hasDraftId]);

  // Re-render every 30s so the relative time stays current
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  if (!hasDraftId) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <CloudOff className="h-3 w-3" />
        Not saved yet
      </span>
    );
  }

  if (saving) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground" aria-live="polite">
        <Loader2 className="h-3 w-3 animate-spin" />
        Saving…
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs text-primary"
      title={lastSaved ? lastSaved.toLocaleString() : undefined}
      aria-live="polite"
      data-tick={tick}
    >
      <Check className="h-3 w-3" />
      ✓ Progress saved
      {lastSaved && (
        <span className="text-muted-foreground hidden sm:inline">
          · {formatDistanceToNow(lastSaved, { addSuffix: true })}
        </span>
      )}
    </span>
  );
};

export default AutoSaveIndicator;
