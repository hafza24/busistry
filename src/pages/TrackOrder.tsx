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
} from "lucide-react";
import { cn } from "@/lib/utils";

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
              <Badge
                variant="outline"
                className={cn(
                  "capitalize",
                  cancelled
                    ? "bg-destructive/10 text-destructive border-destructive/20"
                    : result.status === "delivered"
                    ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                    : "bg-blue-100 text-blue-800 border-blue-200"
                )}
              >
                {result.status}
              </Badge>
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
