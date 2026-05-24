import { ReactNode } from "react";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: ReactNode;
  hint?: string;
  className?: string;
}

const LockedTile = ({ label, value, hint, className }: Props) => (
  <div
    className={cn(
      "relative rounded-lg border border-primary/15 bg-gradient-to-br from-primary/5 via-background to-background px-3 py-2.5 shadow-[inset_0_1px_0_0_hsl(var(--primary)/0.05)]",
      className,
    )}
  >
    <div className="flex items-center justify-between gap-2">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{label}</span>
      <Lock className="h-3 w-3 text-primary/60" />
    </div>
    <div className="text-sm font-semibold text-foreground tabular-nums mt-0.5">{value}</div>
    {hint && <div className="text-[10px] text-muted-foreground mt-0.5">{hint}</div>}
  </div>
);

export default LockedTile;
