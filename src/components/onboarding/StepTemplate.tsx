import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Eye, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import StepShell from "./StepShell";
import { OnboardingData } from "@/hooks/useOnboarding";

interface Props {
  data: OnboardingData;
  update: (p: Partial<OnboardingData>) => void;
}

const StepTemplate = ({ data, update }: Props) => {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["onboarding_templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("templates")
        .select("*")
        .eq("is_active", true)
        .order("price_pkr");
      if (error) throw error;
      return data;
    },
  });

  const categories = ["All", ...Array.from(new Set(templates.map((t: any) => t.category).filter(Boolean)))];
  const filtered = templates.filter((t: any) => {
    if (cat !== "All" && t.category !== cat) return false;
    if (q && !t.name?.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <StepShell title="Choose your Template" subtitle="Pick a starting design. Most Templates are free — premium picks are a one-time charge added at checkout.">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search Templates…" className="pl-9" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {categories.map((c) => (
            <Button key={c} size="sm" variant={cat === c ? "default" : "outline"} onClick={() => setCat(c)}>
              {c}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="py-16 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {filtered.map((t: any) => {
            const selected = data.template_id === t.id;
            const isFree = !t.price_pkr || t.price_pkr === 0;
            return (
              <Card
                key={t.id}
                className={`overflow-hidden cursor-pointer transition-all ${selected ? "border-primary ring-2 ring-primary/40" : "border-border/60 hover:border-primary/40"}`}
                onClick={() => update({ template_id: t.id })}
              >
                <div className="relative">
                  {t.preview_image_url ? (
                    <img src={t.preview_image_url} alt={t.name} className="h-32 w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="h-32 bg-gradient-to-br from-primary/10 to-accent/10" />
                  )}
                  <Badge className={`absolute top-2 right-2 ${isFree ? "bg-primary hover:bg-primary" : "bg-primary"}`}>
                    {isFree ? "Free" : `PKR ${t.price_pkr.toLocaleString()}`}
                  </Badge>
                  {selected && (
                    <div className="absolute top-2 left-2 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
                <CardContent className="p-3 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-sm truncate">{t.name}</p>
                    {t.demo_url && (
                      <a
                        href={t.demo_url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-muted-foreground hover:text-primary"
                        aria-label="Preview demo"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                  {t.category && <p className="text-[11px] text-muted-foreground">{t.category}</p>}
                </CardContent>
              </Card>
            );
          })}
          {filtered.length === 0 && (
            <p className="col-span-full text-center text-sm text-muted-foreground py-8">No Templates match your filters.</p>
          )}
        </div>
      )}
    </StepShell>
  );
};

export default StepTemplate;
