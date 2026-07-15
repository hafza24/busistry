import { useMemo, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCatalogItems, CATALOG_TYPE_META, type CatalogItemType } from "@/hooks/useCatalog";
import CatalogCard from "./CatalogCard";

const FILTERS: { id: "all" | CatalogItemType; label: string }[] = [
  { id: "all", label: "All" },
  { id: "addon", label: "Add-ons" },
  { id: "integration", label: "Integrations" },
  { id: "page", label: "Pages" },
  { id: "section", label: "Sections" },
  { id: "popup", label: "Popups" },
  { id: "plan_upgrade", label: "Plan upgrades" },
  { id: "product_limit", label: "Product limits" },
  { id: "category_limit", label: "Category limits" },
  { id: "extend_duration", label: "Extend hosting" },
  { id: "content_tweak", label: "Content tweaks" },
];

export default function CatalogGrid() {
  const { data: items = [], isLoading } = useCatalogItems();
  const [filter, setFilter] = useState<"all" | CatalogItemType>("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items.filter((i) => {
      if (filter !== "all" && i.type !== filter) return false;
      if (!term) return true;
      return (
        i.name.toLowerCase().includes(term) ||
        (i.short_description ?? "").toLowerCase().includes(term) ||
        (i.category ?? "").toLowerCase().includes(term)
      );
    });
  }, [items, filter, q]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative md:max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search the catalog…"
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Button
              key={f.id}
              size="sm"
              variant={filter === f.id ? "default" : "outline"}
              className="rounded-full h-8"
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-12 text-center">
          Nothing matches those filters yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <CatalogCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {!isLoading && filter === "all" && (
        <p className="text-xs text-muted-foreground text-center">
          {items.length} item{items.length === 1 ? "" : "s"} in the catalog.
        </p>
      )}

      <p className="sr-only">
        {CATALOG_TYPE_META.addon.label} and other types unified in one catalog.
      </p>
    </div>
  );
}
