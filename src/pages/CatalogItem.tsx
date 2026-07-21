import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, Check, Loader2, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCatalogItem, useRelatedCatalogItems, CATALOG_TYPE_META } from "@/hooks/useCatalog";
import CatalogCard from "@/components/catalog/CatalogCard";
import CatalogCheckoutDialog from "@/components/catalog/CatalogCheckoutDialog";

export default function CatalogItem() {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: item, isLoading } = useCatalogItem(slug);
  const { data: related = [] } = useRelatedCatalogItems(item?.related_item_ids ?? []);
  const [dialogOpen, setDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="font-display text-3xl font-bold">Item not found</h1>
        <Button asChild variant="outline"><Link to="/marketplace">Back to marketplace</Link></Button>
      </div>
    );
  }

  const meta = CATALOG_TYPE_META[item.type];
  const priceLabel =
    item.price_pkr > 0 ? `PKR ${Number(item.price_pkr).toLocaleString()}` : "Free";
  const priceSuffix =
    item.pricing_type === "monthly"
      ? "/ month"
      : item.pricing_type === "per_unit"
        ? `/ ${item.per_unit_label ?? "unit"}`
        : "one-time";

  const handleCTA = () => {
    if (!user) {
      navigate(`/auth?redirect=/marketplace/${item.slug}`);
      return;
    }
    setDialogOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl space-y-12">
      <SEO
        title={item.meta_title ?? `${item.name} — Busistree Marketplace`}
        description={item.meta_description ?? item.short_description ?? undefined}
        path={`/marketplace/${item.slug}`}
        image={item.og_image ?? item.cover_image ?? undefined}
      />

      <Button asChild variant="ghost" size="sm" className="w-fit gap-2">
        <Link to="/marketplace"><ArrowLeft className="h-4 w-4" /> Back to marketplace</Link>
      </Button>

      {/* Hero */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="rounded-3xl overflow-hidden border border-border/60 bg-muted/30 aspect-video flex items-center justify-center">
          {item.cover_image ? (
            <img src={item.cover_image} alt={item.name} className="h-full w-full object-cover" />
          ) : (
            <Sparkles className="h-16 w-16 text-primary/40" />
          )}
        </div>
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{meta.label}</Badge>
            {item.category && <Badge variant="secondary">{item.category}</Badge>}
            {item.is_popular && <Badge variant="secondary">Popular</Badge>}
            {item.is_recommended && <Badge className="bg-primary/10 text-primary hover:bg-primary/15 border-transparent rounded-lg px-2">Recommended</Badge>}
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight">{item.name}</h1>
          {item.short_description && (
            <p className="text-lg text-muted-foreground">{item.short_description}</p>
          )}
          <div className="pt-2">
            <p className="text-3xl font-bold text-primary">
              {priceLabel}
              <span className="text-sm text-muted-foreground font-normal ml-2">{priceSuffix}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button size="lg" onClick={handleCTA} className="rounded-xl">
              Add to my site
            </Button>
            {item.demo_url && (
              <Button asChild size="lg" variant="outline" className="rounded-xl">
                <a href={item.demo_url} target="_blank" rel="noreferrer">View demo</a>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Long description */}
      {item.long_description && (
        <section className="max-w-3xl">
          <h2 className="font-display text-2xl font-bold mb-3">About this {meta.label.toLowerCase()}</h2>
          <div className="prose prose-sm md:prose-base max-w-none whitespace-pre-wrap text-muted-foreground">
            {item.long_description}
          </div>
        </section>
      )}

      {/* Features */}
      {item.features.length > 0 && (
        <section>
          <h2 className="font-display text-2xl font-bold mb-4">What's included</h2>
          <ul className="grid sm:grid-cols-2 gap-3">
            {item.features.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Gallery */}
      {item.gallery.length > 0 && (
        <section>
          <h2 className="font-display text-2xl font-bold mb-4">Gallery</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {item.gallery.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noreferrer" className="rounded-xl overflow-hidden border border-border/60 hover:border-primary/40 transition-colors">
                <img src={url} alt={`${item.name} gallery ${i + 1}`} className="w-full h-48 object-cover" loading="lazy" />
              </a>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      {item.faq.length > 0 && (
        <section className="max-w-3xl">
          <h2 className="font-display text-2xl font-bold mb-4">FAQ</h2>
          <Accordion type="single" collapsible className="w-full">
            {item.faq.map((f, i) => (
              <AccordionItem key={i} value={`f-${i}`}>
                <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground whitespace-pre-wrap">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      )}

      {/* Related */}
      {related.length > 0 && (
        <section>
          <h2 className="font-display text-2xl font-bold mb-4">You might also like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {related.map((r) => <CatalogCard key={r.id} item={r} />)}
          </div>
        </section>
      )}

      {/* Sticky-ish CTA card */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <p className="font-display text-xl font-bold">Ready to add {item.name}?</p>
            <p className="text-sm text-muted-foreground">Our team installs it for you within 24–48h.</p>
          </div>
          <Button size="lg" onClick={handleCTA} className="rounded-xl shrink-0">Add to my site</Button>
        </CardContent>
      </Card>

      <CatalogCheckoutDialog open={dialogOpen} onOpenChange={setDialogOpen} item={item} />
    </div>
  );
}
