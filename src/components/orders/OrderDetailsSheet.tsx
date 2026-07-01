import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Globe,
  Layers,
  Package,
  Calendar,
  ImageIcon,
  ExternalLink,
  Loader2,
  CheckCircle2,
  Circle,
  Phone,
  Mail,
  MapPin,
  FileText,
  Wallet,
  Hash,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";
import { OrderStatusTimeline, mapStatusToStage, TimelineStage } from "@/components/orders/OrderStatusTimeline";
import { cn } from "@/lib/utils";

type OrderRow = {
  id: string;
  store_name: string;
  status: string;
  created_at: string;
  updated_at: string | null;
  admin_notes: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  address: string | null;
  business_description: string | null;
  additional_notes: string | null;
  payment_method: string | null;
  amount: number | null;
  transaction_id: string | null;
  screenshot_url: string | null;
  domain_preference: string | null;
  onboarding_submission_id?: string | null;
  plans?: { name: string; type: string; price_pkr: number } | null;
  templates?: { name: string; niche: string } | null;
};

type AddonRow = {
  id: string;
  quantity: number;
  price_snapshot_pkr: number;
  pricing_type_snapshot: string | null;
  addons: { name: string; icon: string | null; per_unit_label: string | null } | null;
};

interface Props {
  order: OrderRow | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

/**
 * Steps a store goes through post-order until it's live for the customer.
 * These are informational — the actual state comes from `mapStatusToStage`.
 */
const ACTIVATION_STEPS: { key: TimelineStage; title: string; body: string }[] = [
  { key: "payment_approved", title: "Payment verified", body: "Your PKR payment is confirmed and the build queue is unlocked." },
  { key: "in_development", title: "Site being built", body: "We're wiring up your template, branding, and content." },
  { key: "qa_review", title: "Quality assurance", body: "Cross-device testing, performance checks, and content review." },
  { key: "ready_for_delivery", title: "Ready to hand off", body: "Preparing your admin credentials and walkthrough." },
  { key: "delivered", title: "Live and yours", body: "Credentials shared. Your website is live and ready to grow." },
];

const stageIndex = (s: TimelineStage) =>
  ["payment_submitted", "verification_pending", "payment_approved", "in_development", "qa_review", "ready_for_delivery", "delivered"].indexOf(s);

export const OrderDetailsSheet = ({ order, open, onOpenChange }: Props) => {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loadingProof, setLoadingProof] = useState(false);
  const [addons, setAddons] = useState<AddonRow[]>([]);
  const [loadingAddons, setLoadingAddons] = useState(false);

  useEffect(() => {
    setSignedUrl(null);
    if (!open || !order?.screenshot_url) return;
    const raw = order.screenshot_url;
    if (raw.startsWith("http")) {
      setSignedUrl(raw);
      return;
    }
    setLoadingProof(true);
    const path = raw.replace(/^payment-screenshots\//, "");
    supabase.storage
      .from("payment-screenshots")
      .createSignedUrl(path, 60 * 10)
      .then(({ data }) => {
        if (data?.signedUrl) setSignedUrl(data.signedUrl);
      })
      .finally(() => setLoadingProof(false));
  }, [open, order?.screenshot_url]);

  useEffect(() => {
    setAddons([]);
    if (!open || !order?.onboarding_submission_id) return;
    setLoadingAddons(true);
    supabase
      .from("onboarding_addons")
      .select("id, quantity, price_snapshot_pkr, pricing_type_snapshot, addons(name, icon, per_unit_label)")
      .eq("submission_id", order.onboarding_submission_id)
      .then(({ data }) => {
        setAddons((data as any) || []);
      })
      .then(() => setLoadingAddons(false));
  }, [open, order?.onboarding_submission_id]);

  if (!order) return null;

  const currentStage = mapStatusToStage(order.status);
  const currentIdx = stageIndex(currentStage);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="text-left">
          <div className="flex items-start gap-3">
            <div className="h-11 w-11 rounded-lg bg-primary/10 text-primary grid place-items-center flex-shrink-0">
              <Globe className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <SheetTitle className="font-display text-xl truncate">{order.store_name}</SheetTitle>
              <SheetDescription className="text-xs font-mono">
                Order #{order.id.slice(0, 8)}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Summary grid */}
          <section className="grid grid-cols-2 gap-3">
            <SummaryTile
              icon={Layers}
              label="Template"
              value={order.templates?.name || "—"}
              hint={order.templates?.niche}
            />
            <SummaryTile
              icon={Package}
              label="Plan"
              value={order.plans?.name || "—"}
              hint={order.plans?.type}
            />
            <SummaryTile
              icon={Calendar}
              label="Requested"
              value={format(new Date(order.created_at), "dd MMM yyyy")}
              hint={format(new Date(order.created_at), "h:mm a")}
            />
            <SummaryTile
              icon={Wallet}
              label="Amount"
              value={order.amount ? `PKR ${Number(order.amount).toLocaleString()}` : "—"}
              hint={order.payment_method || undefined}
            />
          </section>

          <Separator />

          {/* Status timeline */}
          <section>
            <SectionTitle>Status & Progress</SectionTitle>
            <OrderStatusTimeline
              status={order.status}
              updatedAt={order.updated_at ?? order.created_at}
              note={order.admin_notes}
            />
          </section>

          {/* Activation steps */}
          <section>
            <SectionTitle>Store Activation Steps</SectionTitle>
            <ol className="space-y-3">
              {ACTIVATION_STEPS.map((step) => {
                const idx = stageIndex(step.key);
                const done = idx < currentIdx;
                const active = idx === currentIdx;
                return (
                  <li
                    key={step.key}
                    className={cn(
                      "flex gap-3 rounded-lg border p-3 transition-colors",
                      active ? "border-primary/40 bg-primary/5" : done ? "border-border bg-muted/30" : "border-border/60 bg-card",
                    )}
                  >
                    <div className="pt-0.5">
                      {done ? (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      ) : active ? (
                        <div className="h-5 w-5 rounded-full bg-primary/10 grid place-items-center">
                          <Loader2 className="h-3 w-3 text-primary animate-spin" />
                        </div>
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground/40" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className={cn("text-sm font-medium", !done && !active && "text-muted-foreground")}>
                        {step.title}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{step.body}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          {/* Payment proof */}
          <section>
            <SectionTitle>Payment Proof</SectionTitle>
            <div className="grid gap-2 text-sm">
              <KeyRow icon={Wallet} label="Method" value={order.payment_method || "—"} />
              <KeyRow icon={Hash} label="Transaction ID" value={order.transaction_id || "—"} mono />
            </div>

            {order.screenshot_url ? (
              <div className="mt-3 rounded-lg border border-border overflow-hidden bg-muted">
                {loadingProof ? (
                  <div className="h-40 grid place-items-center text-muted-foreground text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : signedUrl ? (
                  <a href={signedUrl} target="_blank" rel="noopener noreferrer" className="block group">
                    <img
                      src={signedUrl}
                      alt="Payment screenshot"
                      className="w-full max-h-80 object-contain bg-background"
                    />
                    <div className="flex items-center justify-between px-3 py-2 text-xs bg-card border-t border-border">
                      <span className="text-muted-foreground">Uploaded screenshot</span>
                      <span className="inline-flex items-center gap-1 text-primary group-hover:underline">
                        Open full size <ExternalLink className="h-3 w-3" />
                      </span>
                    </div>
                  </a>
                ) : (
                  <div className="h-40 grid place-items-center text-muted-foreground text-sm gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Couldn't load screenshot
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-3 rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground text-center">
                No payment screenshot uploaded.
              </div>
            )}
          </section>

          {/* Contact & site details */}
          <section>
            <SectionTitle>Contact & Site Details</SectionTitle>
            <div className="grid gap-2 text-sm">
              <KeyRow icon={Phone} label="Phone" value={order.contact_phone || "—"} />
              <KeyRow icon={Mail} label="Email" value={order.contact_email || "—"} />
              <KeyRow icon={MapPin} label="Address" value={order.address || "—"} />
              <KeyRow icon={Globe} label="Domain" value={order.domain_preference || "—"} />
            </div>
            {(order.business_description || order.additional_notes) && (
              <div className="mt-3 grid gap-2">
                {order.business_description && (
                  <NoteBlock icon={FileText} title="Business description">
                    {order.business_description}
                  </NoteBlock>
                )}
                {order.additional_notes && (
                  <NoteBlock icon={FileText} title="Additional notes">
                    {order.additional_notes}
                  </NoteBlock>
                )}
              </div>
            )}
          </section>

          <div className="pt-2">
            <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-3">{children}</h3>
);

const SummaryTile = ({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Globe;
  label: string;
  value: string;
  hint?: string;
}) => (
  <div className="rounded-lg border border-border bg-card p-3">
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </div>
    <div className="text-sm font-medium text-foreground truncate">{value}</div>
    {hint && <div className="text-xs text-muted-foreground mt-0.5 truncate">{hint}</div>}
  </div>
);

const KeyRow = ({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: typeof Globe;
  label: string;
  value: string;
  mono?: boolean;
}) => (
  <div className="flex items-start gap-3 rounded-md border border-border/60 bg-muted/30 px-3 py-2">
    <Icon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
    <div className="flex-1 min-w-0">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={cn("text-sm text-foreground break-words", mono && "font-mono")}>{value}</div>
    </div>
  </div>
);

const NoteBlock = ({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Globe;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="rounded-lg border border-border bg-muted/30 p-3">
    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1">
      <Icon className="h-3.5 w-3.5" />
      {title}
    </div>
    <p className="text-sm text-foreground whitespace-pre-wrap">{children}</p>
  </div>
);

export default OrderDetailsSheet;
