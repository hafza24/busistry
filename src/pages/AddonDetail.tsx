import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ExternalLink,
  FileText,
  Globe,
  LayoutGrid,
  Loader2,
  MessageCircle,
  MessageSquare,
  Plug,
  Sparkles,
} from "lucide-react";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { useAuth } from "@/contexts/AuthContext";
import { useStores } from "@/hooks/useStores";
import { useCreateStoreAddon } from "@/hooks/useMarketplace";
import CheckoutDialog from "@/components/marketplace/CheckoutDialog";
import WebsiteSelectionModal from "@/components/marketplace/WebsiteSelectionModal";

const SUPPORT_WHATSAPP = "923157224340";

const typeIcon: Record<string, any> = {
  page: FileText,
  section: LayoutGrid,
  popup: MessageSquare,
};

const typeLabel: Record<string, string> = {
  page: "Page",
  section: "Section",
  popup: "Popup",
};

export default function AddonDetail() {
  const { kind = "product", slug = "" } = useParams();
  const isIntegration = kind === "integration";
  const table = isIntegration ? "integrations" : "website_products";
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: stores = [] } = useStores();
  const createAddon = useCreateStoreAddon();

  const { data: item, isLoading } = useQuery({
    queryKey: ["addon_detail", table, slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(table as any)
        .select("*")
        .eq("slug", slug)
        .eq("is_enabled", true)
        .maybeSingle();
      if (error) throw error;
      return data as any;
    },
    enabled: !!slug,
  });

  const { data: related = [] } = useQuery({
    queryKey: ["addon_related", table, item?.id, (item as any)?.type],
    enabled: !!item,
    queryFn: async () => {
      let q = supabase.from(table as any).select("*").eq("is_enabled", true).neq("id", item.id).limit(3);
      if (!isIntegration && item.type) q = q.eq("type", item.type);
      const { data, error } = await q.order("sort_order");
      if (error) throw error;
      return (data as any[]) ?? [];
    },
  });

  const activeStores = useMemo(
    () => (stores ?? []).filter((s: any) => s.status === "activated" || s.status === "approved"),
    [stores]
  );

  const [websitePicker, setWebsitePicker] = useState(false);
  const [checkout, setCheckout] = useState<{ storeId: string } | null>(null);
  const [config, setConfig] = useState<Record<string, any>>({});

  const onBuy = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setConfig({});
    setWebsitePicker(true);
  };

  const handleWebsiteChosen = (storeId: string) => {
    setCheckout({ storeId });
  };

  const requestOnWhatsApp = () => {
    if (!item) return;
    const priceLabel = `PKR ${Number(item.price_pkr).toLocaleString()}${
      item.pricing_type === "monthly" ? " / month" : " one-time"
    }`;
    const store = activeStores[0];
    const siteLine = store?.subdomain_slug
      ? `My store: ${store.subdomain_slug}.busistree.com`
      : "My store: (not set up yet)";
    const msg =
      `Hi Busistree, I'd like to request this ${isIntegration ? "integration" : "website add-on"}:\n\n` +
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

  const handleCheckoutSubmit = async ({
    storeId,
    payment_method,
    transaction_id,
    screenshot_url,
  }: any) => {
    if (!checkout || !user || !item) return;
    await createAddon.mutateAsync({
      store_id: storeId,
      user_id: user.id,
      item_type: isIntegration ? "integration" : "product",
      item_id: item.id,
      price_snapshot_pkr: item.price_pkr,
      pricing_type_snapshot: item.pricing_type ?? "one_time",
      config,
      payment_method,
      transaction_id,
      screenshot_url: screenshot_url ?? undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-24 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-2xl text-center space-y-4">
        <h1 className="font-display text-3xl font-bold">Add-on not found</h1>
        <p className="text-muted-foreground">
          This item may have been removed or is temporarily unavailable.
        </p>
        <Button asChild>
          <Link to="/addons">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Addons
          </Link>
        </Button>
      </div>
    );
  }

  const Icon = isIntegration ? Plug : typeIcon[item.type] ?? FileText;
  const kindLabel = isIntegration ? "Integration" : typeLabel[item.type] ?? "Add-on";
  const priceSuffix = item.pricing_type === "monthly" ? "/month" : "one-time";
  const features: string[] = Array.isArray(item.features) ? item.features : [];

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl space-y-10">
      <SEO
        title={`${item.name} — Busistree Addons`}
        description={item.description || `Add ${item.name} to your Busistree store.`}
        path={`/addons/${kind}/${item.slug}`}
      />

      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link to="/addons">
            <ArrowLeft className="h-4 w-4 mr-2" /> All addons
          </Link>
        </Button>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Preview */}
        <div className="lg:col-span-3 space-y-4">
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-muted border">
            {!isIntegration && item.preview_image_url ? (
              <OptimizedImage
                src={item.preview_image_url}
                alt={item.name}
                width={1200}
                height={675}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                {isIntegration && item.icon ? (
                  <img src={item.icon} alt={item.name} className="w-24 h-24 rounded-2xl" />
                ) : (
                  <Icon className="h-20 w-20 text-primary/40" />
                )}
              </div>
            )}
            {item.is_popular && (
              <Badge className="absolute top-4 left-4">Popular</Badge>
            )}
          </div>

          {item.demo_url && (
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <a href={item.demo_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" /> View live demo
              </a>
            </Button>
          )}
        </div>

        {/* Info */}
        <div className="lg:col-span-2 space-y-5">
          <div className="space-y-3">
            <Badge variant="outline" className="capitalize">
              <Icon className="h-3 w-3 mr-1" /> {kindLabel}
            </Badge>
            <h1 className="font-display text-3xl md:text-4xl font-bold">{item.name}</h1>
            {item.description && (
              <p className="text-muted-foreground leading-relaxed">{item.description}</p>
            )}
          </div>

          <div className="rounded-2xl border bg-card p-5 space-y-4">
            <div>
              <p className="text-3xl font-bold text-primary">
                PKR {Number(item.price_pkr).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">{priceSuffix}</p>
            </div>
            <div className="grid gap-2">
              <Button size="lg" onClick={onBuy}>
                Add to my website <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button size="lg" variant="secondary" onClick={requestOnWhatsApp}>
                <MessageCircle className="h-4 w-4 mr-2" /> Request on WhatsApp
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Our team installs your add-on within 24–48 hours.
            </p>
          </div>

          {features.length > 0 && (
            <div className="rounded-2xl border bg-card p-5 space-y-2">
              <p className="font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" /> What's included
              </p>
              <ul className="space-y-1.5">
                {features.map((f, i) => (
                  <li key={i} className="text-sm flex gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {isIntegration && Array.isArray(item.credential_schema) && item.credential_schema.length > 0 && (
            <div className="rounded-2xl border bg-muted/30 p-5 space-y-2">
              <p className="font-semibold text-sm">Configuration required</p>
              <p className="text-xs text-muted-foreground">
                You'll be asked for the following when you install:
              </p>
              <ul className="text-sm space-y-1 pt-1">
                {item.credential_schema.map((f: any) => (
                  <li key={f.key} className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-primary" />
                    {f.label || f.key}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-display text-2xl font-bold">You might also like</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r: any) => {
              const RIcon = isIntegration ? Plug : typeIcon[r.type] ?? FileText;
              return (
                <Link
                  key={r.id}
                  to={`/addons/${kind}/${r.slug}`}
                  className="block"
                >
                  <Card className="overflow-hidden hover:shadow-lg hover:border-primary/40 transition-all h-full">
                    {!isIntegration && r.preview_image_url ? (
                      <div className="aspect-video bg-muted overflow-hidden">
                        <img
                          src={r.preview_image_url}
                          alt={r.name}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-muted flex items-center justify-center">
                        <RIcon className="h-10 w-10 text-muted-foreground" />
                      </div>
                    )}
                    <CardContent className="p-4 space-y-1">
                      <p className="font-semibold">{r.name}</p>
                      <p className="text-primary font-bold text-sm">
                        PKR {Number(r.price_pkr).toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <WebsiteSelectionModal
        open={websitePicker}
        onOpenChange={(v) => {
          setWebsitePicker(v);
          if (v) return;
        }}
        onConfirm={(storeId) => {
          setWebsitePicker(false);
          handleWebsiteChosen(storeId);
        }}
        itemName={item.name}
      />

      {checkout && (
        <CheckoutDialog
          open={!!checkout}
          onOpenChange={(v) => !v && setCheckout(null)}
          title={`Order: ${item.name}`}
          amount={item.price_pkr}
          storeId={checkout.storeId}
          configFields={
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-2 rounded-md bg-primary/5 border border-primary/20 text-sm">
                <Globe className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Linked website:</span>
                <span className="font-medium">
                  {activeStores.find((s: any) => s.id === checkout.storeId)?.name ?? "—"}
                </span>
              </div>
              {isIntegration && Array.isArray(item.credential_schema) && item.credential_schema.length > 0 && (
                <div className="space-y-2 p-3 rounded-md border bg-muted/30">
                  <p className="text-sm font-medium">Configuration</p>
                  {item.credential_schema.map((field: any) => (
                    <div key={field.key} className="space-y-1">
                      <Label className="text-xs">{field.label || field.key}</Label>
                      <Input
                        placeholder={field.placeholder}
                        value={config[field.key] ?? ""}
                        onChange={(e) =>
                          setConfig((c) => ({ ...c, [field.key]: e.target.value }))
                        }
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
