import { Badge } from "@/components/ui/badge";
import { Star, Flame, Heart, Award, Sparkles } from "lucide-react";
import { useItemReviewStats, ReviewTargetType, ItemReviewStats } from "@/hooks/useReviews";
import { cn } from "@/lib/utils";

export const useItemStat = (targetType: ReviewTargetType, targetId?: string): ItemReviewStats | undefined => {
  const { data } = useItemReviewStats(targetType);
  if (!targetId) return undefined;
  return data?.find((s) => s.target_id === targetId);
};

export function RatingStars({ value, size = "h-3.5 w-3.5", showValue = true }: { value: number; size?: string; showValue?: boolean }) {
  if (!value || value <= 0) return null;
  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5" aria-label={`Rated ${value} of 5`}>
        {[1,2,3,4,5].map((n) => (
          <Star key={n} className={cn(size, n <= Math.round(value) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30")} />
        ))}
      </div>
      {showValue && <span className="text-xs font-medium">{Number(value).toFixed(1)}</span>}
    </div>
  );
}

export function ItemBadges({ stat, compact = false }: { stat?: ItemReviewStats; compact?: boolean }) {
  if (!stat) return null;
  const items: { key: string; label: string; icon: any; className: string; show: boolean }[] = [
    { key: "featured", label: "Featured", icon: Sparkles, className: "bg-gradient-to-r from-primary to-accent text-primary-foreground border-0", show: stat.is_featured },
    { key: "top", label: "Top rated", icon: Award, className: "bg-yellow-500/15 text-yellow-700 border-yellow-500/30 dark:text-yellow-400", show: stat.is_top && !stat.is_featured },
    { key: "popular", label: "Popular", icon: Flame, className: "bg-orange-500/15 text-orange-700 border-orange-500/30 dark:text-orange-400", show: stat.is_popular },
    { key: "liked", label: "Loved", icon: Heart, className: "bg-pink-500/15 text-pink-700 border-pink-500/30 dark:text-pink-400", show: stat.is_liked && !stat.is_top && !stat.is_featured },
  ].filter((b) => b.show);
  if (items.length === 0) return null;
  return (
    <div className={cn("flex flex-wrap gap-1", compact && "gap-0.5")}>
      {items.map((b) => (
        <Badge key={b.key} variant="outline" className={cn("text-[10px] gap-1 py-0 h-5", b.className)}>
          <b.icon className="h-2.5 w-2.5" /> {b.label}
        </Badge>
      ))}
    </div>
  );
}
