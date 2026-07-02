import { useState, useMemo } from "react";
import { useWebsiteProducts, useIntegrations, useCreateStoreAddon } from "@/hooks/useMarketplace";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Search, ExternalLink, Sparkles, Plug, FileText, LayoutGrid, MessageSquare, MessageCircle } from "lucide-react";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { useAuth } from "@/contexts/AuthContext";
import CheckoutDialog from "./CheckoutDialog";
import WebsiteSelectionModal from "./WebsiteSelectionModal";
import { useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { useStores } from "@/hooks/useStores";
import { Badge as BadgeUI } from "@/components/ui/badge";
import { Globe } from "lucide-react";

interface Props {
  /** When provided, items will be installed onto this store with no store-picker */
  storeId?: string;
}

const typeIcon: Record<string, any> = { page: FileText, section: LayoutGrid, popup: MessageSquare };

export default function MarketplaceGrid({ storeId }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: products = [] } = useWebsiteProducts();
  const { data: integrations = [] } = useIntegrations();
  const { data: stores = [] } = useStores();
  const createAddon = useCreateStoreAddon();

  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState<any | null>(null);
  const [pendingItem, setPendingItem] = useState<{ kind: "product" | "integration"; item: any } | null>(null);
  const [websitePicker, setWebsitePicker] = useState(false);
  const [checkout, setCheckout] = useState<{ kind: "product" | "integration"; item: any; storeId: string } | null>(null);
  const [config, setConfig] = useState<Record<string, any>>({});

  const activeStores = (stores ?? []).filter((s: any) => s.status === "activated" || s.status === "approved");

  const filteredProducts = useMemo(() => {
    return products.filter((p: any) => {
      if (tab !== "all" && tab !== "products" && p.type !== tab) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [products, tab, search]);

  const filteredIntegrations = useMemo(() => {
    if (tab !== "all" && tab !== "integrations") return [];
    return integrations.filter((i: any) => !search || i.name.toLowerCase().includes(search.toLowerCase()));
  }, [integrations, tab, search]);

  const onBuy = (kind: "product" | "integration", item: any) => {
    if (!user) { navigate("/auth"); return; }
    setConfig({});
    // If a storeId is forced (e.g. from store dashboard) skip selection.
    if (storeId) {
      setCheckout({ kind, item, storeId });
      return;
    }
    // Otherwise require website selection first (enforces dependency rule).
    setPendingItem({ kind, item });
    setWebsitePicker(true);
  };

  const handleWebsiteChosen = (chosenStoreId: string) => {
    if (!pendingItem) return;
    setCheckout({ ...pendingItem, storeId: chosenStoreId });
    setPendingItem(null);
  };

  const SUPPORT_WHATSAPP = "923157224340";
  const requestOnWhatsApp = (kind: "product" | "integration", item: any) => {
    const priceLabel = `PKR ${Number(item.price_pkr).toLocaleString()}${item.pricing_type === "monthly" ? " / month" : " one-time"}`;
    const slug = activeStores[0]?.subdomain_slug;
    const siteLine = slug
      ? `My store: ${slug}.busistree.com`
      : "My store: (not set up yet)";
    const msg =
      `Hi Busistree, I'd like to request this ${kind === "integration" ? "integration" : "website add-on"}:\n\n` +
      `• ${item.name}\n` +
      `• Price: ${priceLabel}\n` +
      `• ${siteLine}\n\n` +
      `Please help me get it installed.`;
    window.open(
      `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(msg)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleCheckoutSubmit = async ({ storeId: sId, payment_method, transaction_id, screenshot_url }: any) => {
    if (!checkout || !user) return;
    await createAddon.mutateAsync({
      store_id: sId,
      user_id: user.id,
      item_type: checkout.kind,
      item_id: checkout.item.id,
      price_snapshot_pkr: checkout.item.price_pkr,
      pricing_type_snapshot: checkout.item.pricing_type ?? "one_time",
      config,
      payment_method, transaction_id,
      screenshot_url: screenshot_url ?? undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <Tabs value={tab} onValueChange={setTab} className="w-full md:w-auto">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="page">Pages</TabsTrigger>
            <TabsTrigger value="section">Sections</TabsTrigger>
            <TabsTrigger value="popup">Popups</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search marketplace..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {filteredProducts.length === 0 && filteredIntegrations.length === 0 && (
        <div className="py-16 text-center text-muted-foreground">
          <Sparkles className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p>No items here yet. Check back soon!</p>
        </div>
      )}

      {filteredProducts.length > 0 && (
        <div>
          <h3 className="font-display font-semibold text-lg mb-3">Pages, Sections & Popups</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((p: any) => {
              const Icon = typeIcon[p.type] ?? FileText;
              return (
                <Card key={p.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    {p.preview_image_url ? (
                      <OptimizedImage
                        src={p.preview_image_url}
                        alt={p.name}
                        width={480}
                        height={270}
                        className="group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Icon className="h-10 w-10 text-muted-foreground" aria-hidden="true" /></div>
                    )}
                    {p.is_popular && <Badge className="absolute top-2 left-2">Popular</Badge>}
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Badge variant="outline" className="mb-1 capitalize text-xs"><Icon className="h-3 w-3 mr-1" />{p.type}</Badge>
                        <h4 className="font-semibold text-foreground">{p.name}</h4>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">PKR {p.price_pkr.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">one-time</p>
                      </div>
                    </div>
                    {p.description && <p className="text-sm text-muted-foreground line-clamp-2">{p.description}</p>}
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" className="flex-1 min-w-[90px]" onClick={() => setPreview(p)}>Preview</Button>
                      <Button size="sm" className="flex-1 min-w-[90px]" onClick={() => onBuy("product", p)}>Add</Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full"
                        onClick={() => requestOnWhatsApp("product", p)}
                        aria-label={`Request ${p.name} on WhatsApp`}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" aria-hidden="true" />
                        Request on WhatsApp
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {filteredIntegrations.length > 0 && (
        <div>
          <h3 className="font-display font-semibold text-lg mb-3 flex items-center gap-2"><Plug className="h-5 w-5" /> Integrations</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredIntegrations.map((i: any) => (
              <Card key={i.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      {i.icon ? <img src={i.icon} alt="" className="w-10 h-10 rounded" /> : <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center"><Plug className="h-5 w-5 text-primary" /></div>}
                      <div>
                        <h4 className="font-semibold text-foreground">{i.name}</h4>
                        {i.is_popular && <Badge variant="secondary" className="text-xs">Popular</Badge>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">PKR {i.price_pkr.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{i.pricing_type === "monthly" ? "/month" : "one-time"}</p>
                    </div>
                  </div>
                  {i.description && <p className="text-sm text-muted-foreground line-clamp-3">{i.description}</p>}
                  <div className="flex flex-col gap-2">
                    <Button size="sm" className="w-full" onClick={() => onBuy("integration", i)}>Install</Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full"
                      onClick={() => requestOnWhatsApp("integration", i)}
                      aria-label={`Request ${i.name} on WhatsApp`}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" aria-hidden="true" />
                      Request on WhatsApp
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Dialog open={!!preview} onOpenChange={(v) => !v && setPreview(null)}>
        <DialogContent className="max-w-3xl">
          {preview && (
            <>
              <DialogHeader>
                <DialogTitle>{preview.name}</DialogTitle>
                <DialogDescription>{preview.description}</DialogDescription>
              </DialogHeader>
              {preview.preview_image_url && <img src={preview.preview_image_url} alt={preview.name} className="w-full rounded-lg border" />}
              <div className="flex justify-between items-center pt-2">
                <p className="text-2xl font-bold text-primary">PKR {preview.price_pkr.toLocaleString()}</p>
                <div className="flex flex-wrap gap-2 justify-end">
                  {preview.demo_url && <Button variant="outline" asChild><a href={preview.demo_url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4 mr-2" />Live demo</a></Button>}
                  <Button variant="secondary" onClick={() => requestOnWhatsApp("product", preview)}>
                    <MessageCircle className="h-4 w-4 mr-2" aria-hidden="true" />
                    Request on WhatsApp
                  </Button>
                  <Button onClick={() => { setPreview(null); onBuy("product", preview); }}>Add to my website</Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <WebsiteSelectionModal
        open={websitePicker}
        onOpenChange={(v) => { setWebsitePicker(v); if (!v) setPendingItem(null); }}
        onConfirm={handleWebsiteChosen}
        itemName={pendingItem?.item?.name}
      />

      {checkout && (
        <CheckoutDialog
          open={!!checkout}
          onOpenChange={(v) => !v && setCheckout(null)}
          title={`Order: ${checkout.item.name}`}
          amount={checkout.item.price_pkr}
          storeId={checkout.storeId}
          configFields={
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-2 rounded-md bg-primary/5 border border-primary/20 text-sm">
                <Globe className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Linked website:</span>
                <span className="font-medium">{activeStores.find((s: any) => s.id === checkout.storeId)?.name ?? "—"}</span>
              </div>
              {checkout.kind === "integration" && Array.isArray(checkout.item.credential_schema) && checkout.item.credential_schema.length > 0 && (
                <div className="space-y-2 p-3 rounded-md border bg-muted/30">
                  <p className="text-sm font-medium">Configuration</p>
                  {checkout.item.credential_schema.map((field: any) => (
                    <div key={field.key} className="space-y-1">
                      <Label className="text-xs">{field.label || field.key}</Label>
                      <Input
                        placeholder={field.placeholder}
                        value={config[field.key] ?? ""}
                        onChange={(e) => setConfig((c) => ({ ...c, [field.key]: e.target.value }))}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          }
          onSubmit={handleCheckoutSubmit}
        />
      )}
    </div>
  );
}
