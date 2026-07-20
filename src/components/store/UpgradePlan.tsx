import { useState } from "react";
import { useUpgradeOptions, useCreateUpgradeOrder, useUpgradeOrders } from "@/hooks/useMarketplace";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { TrendingUp, Package, FolderTree, CalendarClock, Crown, Wand2 } from "lucide-react";
import CheckoutDialog from "@/components/marketplace/CheckoutDialog";
import { format } from "date-fns";

interface Props { storeId: string; }

const TYPE_META: Record<string, { label: string; icon: any; description: string }> = {
  plan_change: { label: "Upgrade Plan", icon: Crown, description: "Move to a higher tier" },
  product_limit: { label: "More Products", icon: Package, description: "Increase your product limit" },
  category_limit: { label: "More Categories", icon: FolderTree, description: "Increase your category limit" },
  extend_duration: { label: "Extend Hosting", icon: CalendarClock, description: "Renew your store" },
  content_tweak: { label: "Design / Content Tweaks", icon: Wand2, description: "Request design or content changes to your live site" },
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  approved: "bg-primary/10 text-primary border-primary/30",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function UpgradePlan({ storeId }: Props) {
  const { user } = useAuth();
  const { data: options = [] } = useUpgradeOptions();
  const { data: orders = [] } = useUpgradeOrders(storeId);
  const create = useCreateUpgradeOrder();
  const { data: plans = [] } = useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const { data, error } = await supabase.from("plans").select("*").eq("is_active", true).order("price_pkr");
      if (error) throw error;
      return data;
    },
  });

  const [checkout, setCheckout] = useState<{ type: string; details: any; amount: number; label: string } | null>(null);
  const [tweakNotes, setTweakNotes] = useState<Record<string, string>>({});

  const grouped: Record<string, any[]> = {};
  for (const o of options) {
    grouped[o.upgrade_type] ??= [];
    grouped[o.upgrade_type].push(o);
  }

  const handleSubmit = async ({ payment_method, transaction_id, screenshot_url }: any) => {
    if (!checkout || !user) return;
    await create.mutateAsync({
      user_id: user.id,
      store_id: storeId,
      upgrade_type: checkout.type,
      details: checkout.details,
      amount: checkout.amount,
      payment_method, transaction_id,
      screenshot_url: screenshot_url ?? undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold flex items-center gap-2"><TrendingUp className="h-6 w-6" /> Upgrade & Limits</h2>
        <p className="text-muted-foreground">Need more products, categories, or a higher plan? Place an upgrade order below.</p>
      </div>

      {/* Plan upgrade */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg"><Crown className="h-5 w-5" /> Change Plan</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((p: any) => (
            <Card key={p.id} className="border-border/60">
              <CardContent className="p-4 space-y-2">
                <p className="font-semibold">{p.name}</p>
                <p className="text-xl font-bold text-primary">PKR {p.price_pkr.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{p.max_products} products • {p.max_categories} categories</p>
                <Button size="sm" className="w-full" onClick={() => setCheckout({ type: "plan_change", details: { target_plan_id: p.id, target_plan_name: p.name }, amount: p.price_pkr, label: `Upgrade to ${p.name}` })}>Switch</Button>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Limit / duration upgrades */}
      {(["product_limit","category_limit","extend_duration"] as const).map((type) => {
        const meta = TYPE_META[type];
        const opts = grouped[type] ?? [];
        if (opts.length === 0) return null;
        const Icon = meta.icon;
        return (
          <Card key={type}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><Icon className="h-5 w-5" /> {meta.label}</CardTitle>
              <p className="text-sm text-muted-foreground">{meta.description}</p>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {opts.map((o) => (
                <Card key={o.id} className="border-border/60">
                  <CardContent className="p-4 space-y-2">
                    <p className="font-semibold">{o.label}</p>
                    <p className="text-xl font-bold text-primary">PKR {o.price_pkr.toLocaleString()}</p>
                    <Button size="sm" className="w-full" onClick={() => setCheckout({ type, details: { quantity: o.quantity, label: o.label, option_id: o.id }, amount: o.price_pkr, label: o.label })}>Order</Button>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        );
      })}

      {/* Design / content tweaks */}
      {(() => {
        const meta = TYPE_META.content_tweak;
        const opts = grouped.content_tweak ?? [];
        const Icon = meta.icon;
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><Icon className="h-5 w-5" /> {meta.label}</CardTitle>
              <p className="text-sm text-muted-foreground">{meta.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {opts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tweak packages available yet. Please contact support.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {opts.map((o) => (
                    <Card key={o.id} className="border-border/60">
                      <CardContent className="p-4 space-y-3">
                        <div>
                          <p className="font-semibold">{o.label}</p>
                          <p className="text-xl font-bold text-primary">PKR {o.price_pkr.toLocaleString()}</p>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`tweak-${o.id}`} className="text-xs">Describe the changes you want</Label>
                          <Textarea
                            id={`tweak-${o.id}`}
                            rows={3}
                            placeholder="e.g. Change hero banner text, swap colors to navy, add an About section..."
                            value={tweakNotes[o.id] ?? ""}
                            onChange={(e) => setTweakNotes({ ...tweakNotes, [o.id]: e.target.value })}
                          />
                        </div>
                        <Button
                          size="sm"
                          className="w-full"
                          disabled={!(tweakNotes[o.id] ?? "").trim()}
                          onClick={() => setCheckout({
                            type: "content_tweak",
                            details: { label: o.label, option_id: o.id, notes: tweakNotes[o.id]?.trim() },
                            amount: o.price_pkr,
                            label: o.label,
                          })}
                        >
                          Request Update
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })()}


      {/* Order history */}
      {orders.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Upgrade History</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {orders.map((o: any) => (
              <div key={o.id} className="flex items-center justify-between border-b border-border last:border-0 py-2">
                <div>
                  <p className="font-medium text-sm">{TYPE_META[o.upgrade_type]?.label} — {o.details?.label || o.details?.target_plan_name}</p>
                  {o.details?.notes && <p className="text-xs text-muted-foreground italic mt-0.5">"{o.details.notes}"</p>}
                  <p className="text-xs text-muted-foreground">{format(new Date(o.created_at), "MMM d, yyyy")} • PKR {o.amount.toLocaleString()}</p>
                </div>
                <Badge variant="outline" className={statusColors[o.status]}>{o.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {checkout && (
        <CheckoutDialog
          open={!!checkout}
          onOpenChange={(v) => !v && setCheckout(null)}
          title={checkout.label}
          amount={checkout.amount}
          storeId={storeId}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
