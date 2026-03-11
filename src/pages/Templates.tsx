import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Rocket } from "lucide-react";
import { Link } from "react-router-dom";

const niches = ["All", "Clothing", "Perfume", "Jewelry", "Electronics", "Bakery", "Cosmetics", "Digital"];

// Static demo templates (will be replaced with DB data)
const demoTemplates = [
  { id: "1", name: "Fashion Forward", niche: "Clothing", description: "Modern clothing store with lookbook layout", features: ["Product Gallery", "Size Chart", "Wishlist"] },
  { id: "2", name: "Scent Studio", niche: "Perfume", description: "Elegant perfume boutique with aroma categories", features: ["Fragrance Finder", "Gift Sets", "Reviews"] },
  { id: "3", name: "Jewel Box", niche: "Jewelry", description: "Luxurious jewelry showcase with zoom preview", features: ["360° View", "Custom Engraving", "Gift Wrap"] },
  { id: "4", name: "TechMart", niche: "Electronics", description: "Feature-rich electronics store with specs comparison", features: ["Compare Products", "Tech Specs", "Warranty Info"] },
  { id: "5", name: "Sweet Treats", niche: "Bakery", description: "Delicious bakery with order scheduling", features: ["Order Scheduling", "Custom Cakes", "Menu Cards"] },
  { id: "6", name: "Glow Up", niche: "Cosmetics", description: "Beauty & cosmetics store with shade finder", features: ["Shade Finder", "Skin Quiz", "Tutorials"] },
  { id: "7", name: "DigiShelf", niche: "Digital", description: "Digital products marketplace with instant delivery", features: ["Instant Download", "License Keys", "Preview"] },
  { id: "8", name: "Urban Style", niche: "Clothing", description: "Streetwear store with bold typography", features: ["Lookbook", "Size Guide", "Social Feed"] },
];

const Templates = () => {
  const [activeNiche, setActiveNiche] = useState("All");

  const filtered = activeNiche === "All" ? demoTemplates : demoTemplates.filter((t) => t.niche === activeNiche);

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

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((t) => (
            <Card key={t.id} className="group border-border/50 hover:shadow-lg hover:border-primary/20 transition-all flex flex-col">
              <div className="h-44 bg-gradient-to-br from-primary/10 to-accent/10 rounded-t-lg flex items-center justify-center">
                <span className="text-4xl opacity-60">🖼️</span>
              </div>
              <CardContent className="p-5 flex-1">
                <Badge variant="secondary" className="mb-2">{t.niche}</Badge>
                <h3 className="font-semibold font-display text-lg text-foreground">{t.name}</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-3">{t.description}</p>
                <div className="flex flex-wrap gap-1">
                  {t.features.map((f) => (
                    <span key={f} className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{f}</span>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="p-5 pt-0 gap-2">
                <Button size="sm" className="flex-1" asChild>
                  <Link to="/auth">
                    <Rocket className="h-3.5 w-3.5 mr-1" /> Launch Store
                  </Link>
                </Button>
                <Button size="sm" variant="outline">
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Templates;
