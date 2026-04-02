import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Rocket, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

const Templates = () => {
  const [activeNiche, setActiveNiche] = useState("All");

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["public_templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("templates")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const niches = ["All", ...Array.from(new Set(templates.map((t) => t.niche)))];
  const filtered = activeNiche === "All" ? templates : templates.filter((t) => t.niche === activeNiche);

  return (
    <div className="py-16">
      <div className="container">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold font-display text-foreground mb-4">Store Templates</h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Browse stunning, ready-to-launch templates for every niche
          </p>
        </div>

        {/* Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {niches.map((n) => (
            <Button
              key={n}
              variant={activeNiche === n ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveNiche(n)}
            >
              {n}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-20">No templates available yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((t) => {
              const features = Array.isArray(t.features) ? (t.features as string[]) : [];
              return (
                <Card key={t.id} className="group border-border/50 hover:shadow-lg hover:border-primary/20 transition-all flex flex-col">
                  {t.preview_image_url ? (
                    <img src={t.preview_image_url} alt={t.name} className="h-44 w-full object-cover rounded-t-lg" />
                  ) : (
                    <div className="h-44 bg-gradient-to-br from-primary/10 to-accent/10 rounded-t-lg flex items-center justify-center">
                      <span className="text-4xl opacity-60">🖼️</span>
                    </div>
                  )}
                  <CardContent className="p-5 flex-1">
                    <Badge variant="secondary" className="mb-2">{t.niche}</Badge>
                    <h3 className="font-semibold font-display text-lg text-foreground">{t.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1 mb-3">{t.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {features.slice(0, 4).map((f) => (
                        <span key={f} className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{f}</span>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="p-5 pt-0 gap-2">
                    <Button size="sm" className="flex-1" asChild>
                      <Link to="/dashboard">
                        <Rocket className="h-3.5 w-3.5 mr-1" /> Order Now
                      </Link>
                    </Button>
                    {t.demo_url && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={t.demo_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Templates;
