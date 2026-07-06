import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import SEO from "@/components/SEO";
import { useStoreCart, type CartItem } from "@/hooks/useStoreCart";
import { EmptyState } from "@/components/ui/empty-state";

const PREFIX = "busistree:cart:";

const readSlugs = (): string[] => {
  const slugs: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k?.startsWith(PREFIX)) continue;
    try {
      const items = JSON.parse(localStorage.getItem(k) || "[]") as CartItem[];
      if (items.length > 0) slugs.push(k.slice(PREFIX.length));
    } catch { /* ignore */ }
  }
  return Array.from(new Set(slugs));
};

const StoreCartSection = ({ slug }: { slug: string }) => {
  const { cart, updateQty, clearCart, cartTotal } = useStoreCart(slug);

  const { data: store } = useQuery({
    queryKey: ["cart-store", slug],
    queryFn: async () => {
      const { data } = await supabase
        .from("stores")
        .select("id, name, subdomain_slug")
        .eq("subdomain_slug", slug)
        .maybeSingle();
      return data;
    },
  });

  if (cart.length === 0) return null;

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Store</p>
            <Link to={`/shop/${slug}`} className="text-lg font-bold font-display hover:underline truncate block">
              {store?.name || slug}
            </Link>
          </div>
          <Button variant="ghost" size="sm" onClick={clearCart} aria-label="Clear items from this store">
            <Trash2 className="h-4 w-4 mr-1" aria-hidden="true" /> Clear
          </Button>
        </div>

        <div className="divide-y divide-border">
          {cart.map((item) => (
            <div key={item.product.id} className="flex items-center gap-3 py-3">
              <Link to={`/shop/${slug}/product/${item.product.slug}`} className="h-16 w-16 rounded bg-muted overflow-hidden flex-shrink-0">
                {(item.product.images as string[])?.[0] && (
                  <img src={(item.product.images as string[])[0]} alt="" className="w-full h-full object-cover" />
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/shop/${slug}/product/${item.product.slug}`} className="text-sm font-medium hover:underline block truncate">
                  {item.product.name}
                </Link>
                <p className="text-xs text-muted-foreground">PKR {Number(item.product.price).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQty(item.product.id, -1)} aria-label="Decrease quantity">
                  <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>
                <span className="w-8 text-center text-sm" aria-live="polite">{item.quantity}</span>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQty(item.product.id, 1)} aria-label="Increase quantity">
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>
              </div>
              <div className="w-24 text-right">
                <p className="text-sm font-semibold">PKR {(Number(item.product.price) * item.quantity).toLocaleString()}</p>
                <Button variant="ghost" size="sm" className="h-auto p-1 text-xs text-muted-foreground hover:text-destructive" onClick={() => updateQty(item.product.id, -item.quantity)}>
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-border pt-4">
          <div>
            <p className="text-xs text-muted-foreground">Subtotal ({cart.length} item{cart.length !== 1 ? "s" : ""})</p>
            <p className="text-xl font-bold">PKR {cartTotal.toLocaleString()}</p>
          </div>
          <Button asChild>
            <Link to={`/checkout/${slug}`}>
              Proceed to Checkout <ArrowRight className="h-4 w-4 ml-2" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const Cart = () => {
  const [slugs, setSlugs] = useState<string[]>([]);

  useEffect(() => {
    setSlugs(readSlugs());
    const refresh = () => setSlugs(readSlugs());
    window.addEventListener("storage", refresh);
    const interval = window.setInterval(refresh, 1500);
    return () => {
      window.removeEventListener("storage", refresh);
      window.clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Your Cart — Busistree" description="Review items in your cart, update quantities, and continue to checkout." path="/cart" noindex />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold font-display">Your Cart</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Items are grouped by store. Each store checks out separately.
          </p>
        </div>

        {slugs.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="Your cart is empty"
            description="Browse a store to add items to your cart."
            action={
              <Button asChild>
                <Link to="/marketplace">Browse marketplace</Link>
              </Button>
            }
          />
        ) : (
          <div className="space-y-5">
            {slugs.map((slug) => (
              <StoreCartSection key={slug} slug={slug} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
