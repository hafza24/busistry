import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ArrowLeft, Loader2, CheckCircle2, ShoppingBag } from "lucide-react";
import SEO from "@/components/SEO";
import { EmptyState } from "@/components/ui/empty-state";
import { useStoreCart } from "@/hooks/useStoreCart";

const shippingSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number")
    .max(30)
    .regex(/^[+0-9()\-\s]+$/, "Only digits, spaces, +, -, ()"),
  email: z
    .string()
    .trim()
    .max(255)
    .email("Enter a valid email")
    .optional()
    .or(z.literal("")),
  address: z.string().trim().min(5, "Address is required").max(400),
  city: z.string().trim().min(2, "City is required").max(80),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof shippingSchema>;

const Checkout = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { cart, cartTotal, cartCount, updateQty, clearCart } = useStoreCart(slug);

  const [form, setForm] = useState<FormValues>({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<string | null>(null);

  const { data: store, isLoading: storeLoading } = useQuery({
    queryKey: ["checkout-store", slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stores")
        .select("id, name, subdomain_slug")
        .eq("subdomain_slug", slug!)
        .eq("status", "activated")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const setField = <K extends keyof FormValues>(k: K, v: FormValues[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store) return;

    const parsed = shippingSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof FormValues, string>> = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof FormValues;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      toast.error("Please fix the highlighted fields");
      return;
    }

    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setSubmitting(true);
    try {
      const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;
      const fullAddress = `${parsed.data.address}, ${parsed.data.city}${
        parsed.data.notes ? ` — Notes: ${parsed.data.notes}` : ""
      }`;
      const items = cart.map((i) => ({
        product_id: i.product.id,
        product_name: i.product.name,
        quantity: i.quantity,
        price: Number(i.product.price),
        total: Number(i.product.price) * i.quantity,
      }));

      const { error: rpcError } = await supabase.rpc("create_order_with_items", {
        p_store_id: store.id,
        p_order_number: orderNumber,
        p_customer_name: parsed.data.name,
        p_customer_email: parsed.data.email || "",
        p_customer_phone: parsed.data.phone,
        p_customer_address: fullAddress,
        p_subtotal: cartTotal,
        p_total: cartTotal,
        p_items: items as any,
      });
      if (rpcError) throw rpcError;

      clearCart();
      setPlacedOrder(orderNumber);
      toast.success(`Order ${orderNumber} placed`);
    } catch (err: any) {
      toast.error(err.message || "Could not place order");
    } finally {
      setSubmitting(false);
    }
  };

  if (storeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-background">
        <SEO title="Checkout — Store not found" description="Store not available." path={`/checkout/${slug}`} noindex />
        <div className="max-w-2xl mx-auto px-4 py-12">
          <EmptyState
            title="Store not available"
            description="This store doesn't exist or isn't currently active."
            action={<Button asChild><Link to="/cart">Back to cart</Link></Button>}
          />
        </div>
      </div>
    );
  }

  if (placedOrder) {
    return (
      <div className="min-h-screen bg-background">
        <SEO title="Order confirmed" description={`Order ${placedOrder} confirmed.`} path={`/checkout/${slug}`} noindex />
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="rounded-full bg-primary/10 p-4 inline-flex mb-4">
            <CheckCircle2 className="h-10 w-10 text-primary" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-bold font-display mb-2">Order placed!</h1>
          <p className="text-muted-foreground mb-1">Order number</p>
          <p className="text-xl font-mono font-semibold mb-6">{placedOrder}</p>
          <p className="text-sm text-muted-foreground mb-8">
            {store.name} will contact you shortly to confirm and arrange delivery.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="outline"><Link to={`/shop/${slug}`}>Continue shopping</Link></Button>
            <Button onClick={() => navigate("/dashboard")}>Go to dashboard</Button>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <SEO title="Checkout — Empty cart" description="Your cart is empty." path={`/checkout/${slug}`} noindex />
        <div className="max-w-2xl mx-auto px-4 py-12">
          <EmptyState
            icon={ShoppingBag}
            title="Nothing to checkout"
            description={`Your cart for ${store.name} is empty.`}
            action={<Button asChild><Link to={`/shop/${slug}`}>Browse {store.name}</Link></Button>}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`Checkout — ${store.name}`}
        description={`Complete your order from ${store.name}.`}
        path={`/checkout/${slug}`}
        noindex
      />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
          <Link to="/cart"><ArrowLeft className="h-4 w-4 mr-1" aria-hidden="true" /> Back to cart</Link>
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold font-display">Checkout</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Ordering from <span className="font-medium text-foreground">{store.name}</span> · Cash on delivery
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* Shipping form */}
          <form onSubmit={handleSubmit} noValidate>
            <Card>
              <CardContent className="p-6 space-y-5">
                <div>
                  <h2 className="text-lg font-semibold font-display">Shipping details</h2>
                  <p className="text-xs text-muted-foreground">We'll use these to deliver your order.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="name">Full name *</Label>
                    <Input id="name" value={form.name} onChange={(e) => setField("name", e.target.value)} aria-invalid={!!errors.name} />
                    {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input id="phone" inputMode="tel" value={form.phone} onChange={(e) => setField("phone", e.target.value)} placeholder="03XX-XXXXXXX" aria-invalid={!!errors.phone} />
                    {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email (optional)</Label>
                    <Input id="email" type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} aria-invalid={!!errors.email} />
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="address">Street address *</Label>
                    <Textarea id="address" rows={2} value={form.address} onChange={(e) => setField("address", e.target.value)} aria-invalid={!!errors.address} />
                    {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="city">City *</Label>
                    <Input id="city" value={form.city} onChange={(e) => setField("city", e.target.value)} aria-invalid={!!errors.city} />
                    {errors.city && <p className="text-xs text-destructive">{errors.city}</p>}
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="notes">Order notes (optional)</Label>
                    <Textarea id="notes" rows={2} value={form.notes} onChange={(e) => setField("notes", e.target.value)} placeholder="Delivery instructions, landmarks, etc." />
                    {errors.notes && <p className="text-xs text-destructive">{errors.notes}</p>}
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                  {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />}
                  Confirm order · PKR {cartTotal.toLocaleString()}
                </Button>
                <p className="text-[11px] text-center text-muted-foreground">
                  By confirming, you agree to pay cash on delivery. The store will contact you to arrange delivery.
                </p>
              </CardContent>
            </Card>
          </form>

          {/* Order summary */}
          <aside>
            <Card className="lg:sticky lg:top-6">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold font-display">Order summary</h2>
                  <span className="text-xs text-muted-foreground">{cartCount} item{cartCount !== 1 ? "s" : ""}</span>
                </div>

                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex gap-3">
                      <div className="h-14 w-14 rounded bg-muted overflow-hidden flex-shrink-0">
                        {(item.product.images as string[])?.[0] && (
                          <img src={(item.product.images as string[])[0]} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.product.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="inline-flex items-center rounded border border-border">
                            <button type="button" className="px-2 py-0.5 text-sm hover:bg-muted" onClick={() => updateQty(item.product.id, -1)} aria-label="Decrease">−</button>
                            <span className="px-2 text-sm">{item.quantity}</span>
                            <button type="button" className="px-2 py-0.5 text-sm hover:bg-muted" onClick={() => updateQty(item.product.id, 1)} aria-label="Increase">+</button>
                          </div>
                          <span className="text-xs text-muted-foreground">× PKR {Number(item.product.price).toLocaleString()}</span>
                        </div>
                      </div>
                      <p className="text-sm font-semibold whitespace-nowrap">
                        PKR {(Number(item.product.price) * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>PKR {cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>Calculated by store</span>
                  </div>
                  <div className="flex justify-between text-base font-semibold pt-2">
                    <span>Total</span>
                    <span>PKR {cartTotal.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
