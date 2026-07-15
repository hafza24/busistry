import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { CATALOG_TYPE_META, type CatalogItem } from "@/hooks/useCatalog";

export default function CatalogCard({ item }: { item: CatalogItem }) {
  const meta = CATALOG_TYPE_META[item.type];
  return (
    <Link to={`/marketplace/${item.slug}`} className="group" aria-label={`View ${item.name}`}>
      <Card className="border-border/60 group-hover:border-primary/40 group-hover:shadow-md transition-all h-full overflow-hidden">
        {item.cover_image ? (
          <img
            src={item.cover_image}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="h-32 w-full object-cover"
          />
        ) : (
          <div className="h-32 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-primary/40" />
          </div>
        )}
        <CardContent className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <Badge variant="outline" className="text-[10px]">{meta.label}</Badge>
            <div className="flex gap-1">
              {item.is_popular && <Badge variant="secondary" className="text-[10px]">Popular</Badge>}
              {item.is_recommended && <Badge className="text-[10px]">Recommended</Badge>}
            </div>
          </div>
          <p className="font-semibold group-hover:text-primary transition-colors line-clamp-1">{item.name}</p>
          {item.short_description && (
            <p className="text-xs text-muted-foreground line-clamp-2">{item.short_description}</p>
          )}
          <p className="text-sm font-bold text-primary pt-1">
            {item.price_pkr > 0 ? `PKR ${Number(item.price_pkr).toLocaleString()}` : "Free"}
            <span className="text-xs text-muted-foreground font-normal ml-1">
              {item.pricing_type === "monthly"
                ? "/ month"
                : item.pricing_type === "per_unit"
                  ? `/ ${item.per_unit_label ?? "unit"}`
                  : "one-time"}
            </span>
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
