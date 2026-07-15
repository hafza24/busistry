import { useMemo, useRef, useState, useEffect } from "react";
import { Loader2, Search, X, Sparkles, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCatalogItems, CATALOG_TYPE_META, type CatalogItem, type CatalogItemType } from "@/hooks/useCatalog";
import CatalogCard from "./CatalogCard";
import { Link } from "react-router-dom";

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

const STOPWORDS = new Set([
  "the","a","an","and","or","for","to","of","in","on","with","your","you","by",
  "is","it","this","that","from","as","at","be","are","our","we","add","get","use","new",
]);

function tokenize(s: string): string[] {
  return (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

export default function CatalogGrid({ previewLimit }: { previewLimit?: number } = {}) {
  const { data: items = [], isLoading } = useCatalogItems();
  const [expanded, setExpanded] = useState(false);
  const [filter, setFilter] = useState<"all" | CatalogItemType>("all");
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setFocused(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Build keyword frequency map across catalog
  const keywords = useMemo(() => {
    const counts = new Map<string, number>();
    for (const i of items) {
      const parts = [
        i.name,
        i.short_description ?? "",
        i.category ?? "",
        i.meta_keywords ?? "",
        (i.features ?? []).join(" "),
      ].join(" ");
      for (const t of tokenize(parts)) {
        counts.set(t, (counts.get(t) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([w]) => w);
  }, [items]);

  const popular = keywords.slice(0, 10);

  const term = q.trim().toLowerCase();

  const suggestions = useMemo(() => {
    if (!term) return { keywords: [] as string[], items: [] as CatalogItem[] };
    const kw = keywords.filter((k) => k.includes(term)).slice(0, 6);
    const its = items
      .filter((i) =>
        i.name.toLowerCase().includes(term) ||
        (i.short_description ?? "").toLowerCase().includes(term)
      )
      .slice(0, 5);
    return { keywords: kw, items: its };
  }, [term, keywords, items]);

  const filtered = useMemo(() => {
    return items.filter((i) => {
      if (filter !== "all" && i.type !== filter) return false;
      if (!term) return true;
      return (
        i.name.toLowerCase().includes(term) ||
        (i.short_description ?? "").toLowerCase().includes(term) ||
        (i.category ?? "").toLowerCase().includes(term) ||
        (i.meta_keywords ?? "").toLowerCase().includes(term)
      );
    });
  }, [items, filter, term]);

  return (
    <div className="space-y-6">






      {isLoading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-12 text-center">
          Nothing matches those filters yet.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(previewLimit && !expanded && !term && filter === "all"
              ? filtered.slice(0, previewLimit)
              : filtered
            ).map((item) => (
              <CatalogCard key={item.id} item={item} />
            ))}
          </div>
          {previewLimit && !expanded && !term && filter === "all" && filtered.length > previewLimit && (
            <div className="flex justify-center pt-2">
              <Button
                onClick={() => setExpanded(true)}
                size="lg"
                variant="outline"
                className="rounded-full gap-2"
              >
                View all {filtered.length} items
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {!isLoading && filter === "all" && (expanded || !previewLimit) && (
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
