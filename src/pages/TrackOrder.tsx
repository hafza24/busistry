import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";
import {
  Package,
  Search,
  Clock,
  CheckCircle2,
  Truck,
  PackageCheck,
  XCircle,
  Loader2,
  AlertCircle,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const schema = z.object({
  order_number: z
    .string()
    .trim()
    .min(3, "Order number is too short")
    .max(64, "Order number is too long"),
  email: z.string().trim().email("Enter a valid email").max(255),
});

type OrderResult = {
  order_number: string;
  status: string;
  customer_name: string;
  total: number;
  shipping_fee: number;
  created_at: string;
  updated_at: string;
  shipped_at: string | null;
  tracking_number: string | null;
  tracking_carrier: string | null;
  tracking_url: string | null;
  store_name: string;
  store_slug: string | null;
};

const steps = [
  { key: "pending", label: "Order placed", icon: Clock },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle2 },
  { key: "processing", label: "Processing", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: PackageCheck },
] as const;

function stepIndex(status: string): number {
  const i = steps.findIndex((s) => s.key === status);
  return i === -1 ? 0 : i;
}

export default function TrackOrder() {
  const [params, setParams] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(params.get("order") ?? "");
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [result, setResult] = useState<OrderResult | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setNotFound(false);
    setResult(null);

    const parsed = schema.safeParse({ order_number: orderNumber, email });
    if (!parsed.success) {
      const fe: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        fe[issue.path[0] as string] = issue.message;
      }
      setErrors(fe);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("lookup_order_status", {
        p_order_number: parsed.data.order_number,
        p_email: parsed.data.email,
      });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      if (!row) {
        setNotFound(true);
      } else {
        setResult(row as OrderResult);
        setParams(
          { order: parsed.data.order_number, email: parsed.data.email },
          { replace: true }
        );
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const [downloading, setDownloading] = useState(false);

  const handleDownloadInvoice = async () => {
    if (!result) return;
    setDownloading(true);
    try {
      const { data, error } = await supabase.rpc("lookup_order_items", {
        p_order_number: result.order_number,
        p_email: email.trim(),
      });
      if (error) throw error;
      const items = (data ?? []) as Array<{
        product_name: string;
        quantity: number;
        price: number;
        total: number;
      }>;

      const [{ default: jsPDF }, autoTableMod] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable"),
      ]);
      const autoTable = (autoTableMod as any).default ?? (autoTableMod as any);

      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const marginX = 40;

      // Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text("INVOICE", marginX, 60);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(90);
      doc.text(result.store_name, pageWidth - marginX, 50, { align: "right" });
      if (result.store_slug) {
        doc.text(`${result.store_slug}.busistree.com`, pageWidth - marginX, 64, {
          align: "right",
        });
      }
      doc.setTextColor(0);

      // Meta box
      const metaY = 100;
      doc.setFontSize(9);
      doc.setTextColor(120);
      doc.text("ORDER NUMBER", marginX, metaY);
      doc.text("ORDER DATE", marginX + 180, metaY);
      doc.text("STATUS", marginX + 340, metaY);
      doc.setTextColor(0);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(result.order_number, marginX, metaY + 15);
      doc.text(
        format(new Date(result.created_at), "MMM d, yyyy"),
        marginX + 180,
        metaY + 15
      );
      doc.text(
        result.status.charAt(0).toUpperCase() + result.status.slice(1),
        marginX + 340,
        metaY + 15
      );

      // Billed to
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(120);
      doc.text("BILLED TO", marginX, metaY + 45);
      doc.setTextColor(0);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(result.customer_name, marginX, metaY + 60);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(email.trim(), marginX, metaY + 74);

      // Items table
      const rows =
        items.length > 0
          ? items.map((it) => [
              it.product_name,
              String(it.quantity),
              `PKR ${Number(it.price).toLocaleString()}`,
              `PKR ${Number(it.total).toLocaleString()}`,
            ])
          : [["Order items unavailable", "", "", ""]];

      autoTable(doc, {
        startY: metaY + 100,
        head: [["Item", "Qty", "Price", "Line total"]],
        body: rows,
        theme: "striped",
        headStyles: { fillColor: [22, 101, 92], textColor: 255 },
        columnStyles: {
          1: { halign: "center", cellWidth: 50 },
          2: { halign: "right", cellWidth: 90 },
          3: { halign: "right", cellWidth: 100 },
        },
        margin: { left: marginX, right: marginX },
        styles: { fontSize: 10, cellPadding: 6 },
      });

      // Totals
      const finalY = (doc as any).lastAutoTable?.finalY ?? metaY + 200;
      const subtotal =
        items.reduce((s, i) => s + Number(i.total || 0), 0) ||
        Number(result.total) - Number(result.shipping_fee || 0);
      const totalsX = pageWidth - marginX - 200;
      const labelX = totalsX;
      const valueX = pageWidth - marginX;
      let y = finalY + 24;
      doc.setFontSize(10);
      doc.text("Subtotal", labelX, y);
      doc.text(`PKR ${Number(subtotal).toLocaleString()}`, valueX, y, {
        align: "right",
      });
      y += 16;
      doc.text("Shipping", labelX, y);
      doc.text(
        `PKR ${Number(result.shipping_fee || 0).toLocaleString()}`,
        valueX,
        y,
        { align: "right" }
      );
      y += 20;
      doc.setDrawColor(200);
      doc.line(labelX, y - 8, valueX, y - 8);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Total", labelX, y);
      doc.text(`PKR ${Number(result.total).toLocaleString()}`, valueX, y, {
        align: "right",
      });

      // Tracking (if any)
      if (result.tracking_number) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(90);
        doc.text(
          `Shipping: ${result.tracking_carrier ?? "Courier"} · Tracking #${result.tracking_number}`,
          marginX,
          y + 40
        );
      }

      // Footer
      doc.setFontSize(9);
      doc.setTextColor(140);
      doc.text(
        `Generated ${format(new Date(), "MMM d, yyyy HH:mm")} · Thank you for your order.`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 30,
        { align: "center" }
      );

      doc.save(`invoice-${result.order_number}.pdf`);
    } catch (err: any) {
      toast.error(err?.message || "Could not generate invoice");
    } finally {
      setDownloading(false);
    }
  };

  const cancelled = result?.status === "cancelled";
  const active = result ? stepIndex(result.status) : 0;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Track your order — Busistree"
        description="Enter your order number and email to see the current status of your order."
        path="/track"
      />

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
            <Package className="h-6 w-6" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            Track your order
          </h1>
          <p className="text-muted-foreground">
            Enter your order number and the email you used at checkout.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order lookup</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-[1fr,1fr,auto] sm:items-end">
              <div className="space-y-1.5">
                <Label htmlFor="order_number">Order number</Label>
                <Input
                  id="order_number"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="e.g. ORD-10234"
                  maxLength={64}
                  autoComplete="off"
                  aria-invalid={!!errors.order_number}
                />
                {errors.order_number && (
                  <p className="text-xs text-destructive">{errors.order_number}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  maxLength={255}
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email}</p>
                )}
              </div>
              <Button type="submit" disabled={loading} className="sm:mb-0.5">
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" /> Track
                  </>
                )}
              </Button>
            </form>

            {notFound && (
              <Alert variant="destructive" className="mt-5">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  We couldn't find an order matching that number and email. Double-check both and try again.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {result && (
          <Card className="mt-6">
            <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Order
                </p>
                <CardTitle className="text-xl">{result.order_number}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  From <span className="font-medium text-foreground">{result.store_name}</span>
                  {" · "}Placed {format(new Date(result.created_at), "MMM d, yyyy")}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <Badge
                  variant="outline"
                  className={cn(
                    "capitalize",
                    cancelled
                      ? "bg-destructive/10 text-destructive border-destructive/20"
                      : result.status === "delivered"
                      ? "bg-primary/10 text-primary border-primary/30"
                      : "bg-primary/10 text-primary border-primary/30"
                  )}
                >
                  {result.status}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadInvoice}
                  disabled={downloading}
                >
                  {downloading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Invoice PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {cancelled ? (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    This order was cancelled on{" "}
                    {format(new Date(result.updated_at), "MMM d, yyyy")}. If this was unexpected, please contact the store.
                  </AlertDescription>
                </Alert>
              ) : (
                <div>
                  <ol className="relative flex justify-between gap-2">
                    {steps.map((s, i) => {
                      const reached = i <= active;
                      const current = i === active;
                      const Icon = s.icon;
                      return (
                        <li key={s.key} className="flex-1 flex flex-col items-center text-center">
                          <div
                            className={cn(
                              "h-9 w-9 rounded-full border-2 flex items-center justify-center transition-colors",
                              reached
                                ? "bg-primary border-primary text-primary-foreground"
                                : "bg-background border-border text-muted-foreground",
                              current && "ring-4 ring-primary/20"
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <p
                            className={cn(
                              "text-[11px] sm:text-xs mt-2 font-medium",
                              reached ? "text-foreground" : "text-muted-foreground"
                            )}
                          >
                            {s.label}
                          </p>
                          {i < steps.length - 1 && (
                            <div
                              className={cn(
                                "absolute top-4 h-0.5",
                                i < active ? "bg-primary" : "bg-border"
                              )}
                              style={{
                                left: `calc(${(i / (steps.length - 1)) * 100}% + 20px)`,
                                right: `calc(${((steps.length - 2 - i) / (steps.length - 1)) * 100}% + 20px)`,
                              }}
                              aria-hidden="true"
                            />
                          )}
                        </li>
                      );
                    })}
                  </ol>
                </div>
              )}

              {!cancelled && result.tracking_number && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">
                      {result.tracking_carrier ? `${result.tracking_carrier} tracking number` : "Tracking number"}
                    </p>
                    <p className="font-mono font-semibold break-all">
                      {result.tracking_number}
                    </p>
                    {result.shipped_at && (
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Shipped {format(new Date(result.shipped_at), "MMM d, yyyy")}
                      </p>
                    )}
                  </div>
                  {result.tracking_url && (
                    <Button asChild variant="outline" size="sm">
                      <a href={result.tracking_url} target="_blank" rel="noopener noreferrer">
                        Track shipment
                      </a>
                    </Button>
                  )}
                </div>
              )}


              <div className="grid gap-4 sm:grid-cols-3 pt-2 border-t">
                <div>
                  <p className="text-xs text-muted-foreground">Customer</p>
                  <p className="text-sm font-medium">{result.customer_name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-sm font-medium">
                    PKR {Number(result.total).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Last update</p>
                  <p className="text-sm font-medium">
                    {format(new Date(result.updated_at), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
