import MarketplaceGrid from "@/components/marketplace/MarketplaceGrid";

export default function MarketplaceBrowser({ storeId }: { storeId: string }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-2xl font-bold">Addons</h2>
        <p className="text-muted-foreground">Add pages, sections, popups and integrations to your website. Our team installs them within 24–48 hours.</p>
      </div>
      <MarketplaceGrid storeId={storeId} />
    </div>
  );
}
