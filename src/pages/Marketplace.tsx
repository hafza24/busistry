import SEO from "@/components/SEO";
import MarketplaceGrid from "@/components/marketplace/MarketplaceGrid";

export default function Marketplace() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <SEO
        title="Marketplace — Busistree add-ons & integrations"
        description="Ready-made pages, sections, popups, and integrations to supercharge your Busistree website. Installed by our team within 24–48 hours."
        path="/marketplace"
      />
      <div className="text-center mb-10 max-w-2xl mx-auto">
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">Marketplace</h1>
        <p className="text-lg text-muted-foreground">
          Supercharge your website with ready-made pages, sections, popups, and integrations.
          Installed by our team within 24–48 hours.
        </p>
      </div>
      <MarketplaceGrid />
    </div>
  );
}
