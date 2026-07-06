import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ShoppingCart, Plus, Minus, Store, Search, PackageSearch, Sparkles, FileText, LayoutGrid, MessageSquare, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductGridSkeleton } from "@/components/ui/loading-skeletons";
import { EmptyState } from "@/components/ui/empty-state";
import SEO from "@/components/SEO";
import { useStoreCart } from "@/hooks/useStoreCart";

const Storefront = () => {
  const { slug } = useParams<{ slug: string }>();
  const { cart, addToCart, updateQty, clearCart, cartTotal, cartCount } = useStoreCart(slug);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [customerForm, setCustomerForm] = useState({ name: "", phone: "", email: "", address: "" });
  const [submitting, setSubmitting] = useState(false);

  const { data: store, isLoading: storeLoading, isError: storeError } = useQuery({
    queryKey: ["storefront-store", slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("subdomain_slug", slug!)
        .eq("status", "activated")
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: settings } = useQuery({
    queryKey: ["storefront-settings", store?.id],
    enabled: !!store,
    queryFn: async () => {
      const { data } = await (supabase as any).from("public_store_settings").select("*").eq("store_id", store!.id).maybeSingle();
      return data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["storefront-categories", store?.id],
    enabled: !!store,
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").eq("store_id", store!.id).eq("is_active", true).order("sort_order");
      return data || [];
    },
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["storefront-products", store?.id],
    enabled: !!store,
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*, categories(name)").eq("store_id", store!.id).eq("is_active", true).order("sort_order");
      return data || [];
    },
  });

  const { data: websiteProducts } = useQuery({
    queryKey: ["storefront-website-products"],
    queryFn: async () => {
      const { data } = await supabase.from("website_products").select("*").eq("is_enabled", true).order("sort_order");
      return data || [];
    },
  });

  const [wpPreview, setWpPreview] = useState<any | null>(null);

  const requestAddon = (item: any) => {
    const phone = (settings?.contact_phone as string | undefined)?.replace(/[^0-9]/g, "");
    const email = settings?.contact_email as string | undefined;
    const msg = `Hi ${store?.name}, I'd like to request "${item.name}" (PKR ${Number(item.price_pkr).toLocaleString()}) for your website.`;
    if (phone) {
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
    } else if (email) {
      window.location.href = `mailto:${email}?subject=${encodeURIComponent(`Request: ${item.name}`)}&body=${encodeURIComponent(msg)}`;
    } else {
      toast.info("This store hasn't set up contact details yet.");
    }
  };

  const typeIcon: Record<string, any> = { page: FileText, section: LayoutGrid, popup: MessageSquare };

  const filteredProducts = products?.filter((p) => {
    const matchesCategory = !selectedCategory || p.category_id === selectedCategory;
    const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAdd = (product: any) => {
    addToCart(product);
    toast.success(`${product.name} added to cart`);
  };


  const handleCheckout = async () => {
    if (!customerForm.name.trim() || !customerForm.phone.trim() || !customerForm.address.trim()) {
      toast.error("Please fill in name, phone, and address");
      return;
    }
    setSubmitting(true);
    try {
      const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;
      const items = cart.map((i) => ({
        product_id: i.product.id,
        product_name: i.product.name,
        quantity: i.quantity,
        price: Number(i.product.price),
        total: Number(i.product.price) * i.quantity,
      }));
      const { error: rpcError } = await supabase.rpc("create_order_with_items", {
        p_store_id: store!.id,
        p_order_number: orderNumber,
        p_customer_name: customerForm.name,
        p_customer_email: customerForm.email,
        p_customer_phone: customerForm.phone,
        p_customer_address: customerForm.address,
        p_subtotal: cartTotal,
        p_total: cartTotal,
        p_items: items as any,
      });
      if (rpcError) throw rpcError;


      toast.success(`Order ${orderNumber} placed successfully!`);
      setCart([]);
      setCheckoutOpen(false);
      setCustomerForm({ name: "", phone: "", email: "", address: "" });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const primaryColor = settings?.primary_color || "#16a34a";

  if (storeLoading) return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-9 w-24" />
        </div>
      </header>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Skeleton className="h-10 w-full max-w-sm mb-6" />
        <ProductGridSkeleton count={8} />
      </div>
    </div>
  );
  if (storeError || !store) return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="rounded-full bg-muted p-4 inline-flex mb-4">
          <Store className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold font-display mb-2">Store Not Found</h1>
        <p className="text-muted-foreground">This store doesn't exist or is not currently active. Please check the link and try again.</p>
      </div>
    </div>
  );

  const seoTitle = `${store.name} — Online Store`;
  const seoDesc = (settings?.description as string | undefined)?.slice(0, 155) ||
    `Shop ${store.name} online. Browse products and order with cash on delivery, powered by Busistree.`;
  const seoImage = (settings?.banner_url || settings?.logo_url) as string | undefined;
  const storeJsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: store.name,
    description: seoDesc,
    ...(seoImage ? { image: seoImage } : {}),
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={seoTitle}
        description={seoDesc}
        path={`/store/${slug}`}
        jsonLd={storeJsonLd}
      />
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {settings?.logo_url && <img src={settings.logo_url} alt="" className="h-8 w-8 rounded object-contain" />}
            <h1 className="text-xl font-bold font-display" style={{ color: primaryColor }}>{store.name}</h1>
          </div>
          <Button variant="outline" className="relative" onClick={() => setCartOpen(true)}>
            <ShoppingCart className="h-4 w-4 mr-2" /> Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">{cartCount}</span>
            )}
          </Button>
        </div>
      </header>

      {/* Banner */}
      {settings?.banner_url && (
        <div className="h-48 md:h-64 overflow-hidden">
          <img src={settings.banner_url} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-6">
        {settings?.description && <p className="text-muted-foreground mb-6">{settings.description}</p>}

        {/* Search & Categories */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant={selectedCategory === null ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(null)}>All</Button>
            {categories?.map((c) => (
              <Button key={c.id} variant={selectedCategory === c.id ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(c.id)}>{c.name}</Button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {productsLoading ? (
          <ProductGridSkeleton count={8} />
        ) : filteredProducts && filteredProducts.length > 0 ? (
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((p) => (
              <Card key={p.id} className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedProduct(p)}>
                <div className="aspect-square bg-muted">
                  {(p.images as string[])?.length > 0 ? (
                    <img src={(p.images as string[])[0]} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No image</div>
                  )}
                </div>
                <CardContent className="p-3">
                  <h3 className="font-medium text-sm truncate">{p.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold text-sm" style={{ color: primaryColor }}>PKR {Number(p.price).toLocaleString()}</span>
                    {p.compare_at_price && (
                      <span className="text-xs text-muted-foreground line-through">PKR {Number(p.compare_at_price).toLocaleString()}</span>
                    )}
                  </div>
                  {p.stock <= 0 && <Badge variant="destructive" className="mt-1 text-xs">Out of stock</Badge>}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={PackageSearch}
            title={searchQuery || selectedCategory ? "No matching products" : "No products yet"}
            description={
              searchQuery || selectedCategory
                ? "Try adjusting your search or category filter."
                : "This store hasn't added any products yet. Please check back soon."
            }
            action={
              (searchQuery || selectedCategory) ? (
                <Button variant="outline" onClick={() => { setSearchQuery(""); setSelectedCategory(null); }}>
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        )}

        {/* Website Add-ons (Pages, Sections, Popups) */}
        {websiteProducts && websiteProducts.length > 0 && (
          <section className="mt-14">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-5 w-5" style={{ color: primaryColor }} aria-hidden="true" />
              <h2 className="text-xl font-bold font-display">Website Add-ons</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Browse ready-made pages, sections, and popups. Request one and {store.name} will get it installed for you.
            </p>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {websiteProducts.map((wp: any) => {
                const Icon = typeIcon[wp.type] ?? FileText;
                return (
                  <Card key={wp.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="aspect-video bg-muted relative">
                      {wp.preview_image_url ? (
                        <img src={wp.preview_image_url} alt={wp.name} loading="lazy" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><Icon className="h-8 w-8 text-muted-foreground" aria-hidden="true" /></div>
                      )}
                      {wp.is_popular && <Badge className="absolute top-2 left-2">Popular</Badge>}
                    </div>
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Badge variant="outline" className="mb-1 capitalize text-xs"><Icon className="h-3 w-3 mr-1" aria-hidden="true" />{wp.type}</Badge>
                          <h3 className="font-medium text-sm truncate">{wp.name}</h3>
                        </div>
                        <span className="font-bold text-sm whitespace-nowrap" style={{ color: primaryColor }}>PKR {Number(wp.price_pkr).toLocaleString()}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => setWpPreview(wp)}>Preview</Button>
                        <Button size="sm" className="flex-1" onClick={() => requestAddon(wp)}>Request</Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* Website Product Preview Dialog */}
      <Dialog open={!!wpPreview} onOpenChange={(o) => !o && setWpPreview(null)}>
        <DialogContent className="max-w-2xl">
          {wpPreview && (
            <>
              <DialogHeader><DialogTitle>{wpPreview.name}</DialogTitle></DialogHeader>
              {wpPreview.preview_image_url && (
                <img src={wpPreview.preview_image_url} alt={wpPreview.name} className="w-full rounded-lg border" />
              )}
              {wpPreview.description && <p className="text-sm text-muted-foreground">{wpPreview.description}</p>}
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <div className="flex-1 text-left">
                  <span className="text-xl font-bold" style={{ color: primaryColor }}>PKR {Number(wpPreview.price_pkr).toLocaleString()}</span>
                </div>
                {wpPreview.demo_url && (
                  <Button variant="outline" asChild>
                    <a href={wpPreview.demo_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" aria-hidden="true" /> Live demo
                    </a>
                  </Button>
                )}
                <Button onClick={() => { requestAddon(wpPreview); setWpPreview(null); }}>Request this</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>


      {/* Product Detail Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={(o) => !o && setSelectedProduct(null)}>
        <DialogContent className="max-w-md">
          {selectedProduct && (
            <>
              <DialogHeader><DialogTitle>{selectedProduct.name}</DialogTitle></DialogHeader>
              {(selectedProduct.images as string[])?.length > 0 && (
                <img src={(selectedProduct.images as string[])[0]} alt="" className="w-full h-64 object-cover rounded" />
              )}
              <p className="text-muted-foreground text-sm">{selectedProduct.description || "No description"}</p>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold" style={{ color: primaryColor }}>PKR {Number(selectedProduct.price).toLocaleString()}</span>
                {selectedProduct.compare_at_price && (
                  <span className="text-muted-foreground line-through">PKR {Number(selectedProduct.compare_at_price).toLocaleString()}</span>
                )}
              </div>
              <DialogFooter>
                <Button className="w-full" disabled={selectedProduct.stock <= 0} onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}>
                  {selectedProduct.stock > 0 ? "Add to Cart" : "Out of Stock"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Cart Dialog */}
      <Dialog open={cartOpen} onOpenChange={setCartOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Shopping Cart</DialogTitle></DialogHeader>
          {cart.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Your cart is empty</p>
          ) : (
            <div className="space-y-3 max-h-[50vh] overflow-y-auto">
              {cart.map((item) => (
                <div key={item.product.id} className="flex items-center gap-3 border-b border-border pb-3">
                  <div className="h-12 w-12 rounded bg-muted overflow-hidden flex-shrink-0">
                    {(item.product.images as string[])?.length > 0 && (
                      <img src={(item.product.images as string[])[0]} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground">PKR {Number(item.product.price).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQty(item.product.id, -1)} aria-label="Decrease quantity"><Minus className="h-3 w-3" aria-hidden="true" /></Button>
                    <span className="w-6 text-center text-sm" aria-live="polite">{item.quantity}</span>
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQty(item.product.id, 1)} aria-label="Increase quantity"><Plus className="h-3 w-3" aria-hidden="true" /></Button>
                  </div>
                  <span className="text-sm font-medium w-20 text-right">PKR {(Number(item.product.price) * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
          {cart.length > 0 && (
            <>
              <div className="flex justify-between font-bold border-t border-border pt-3">
                <span>Total</span><span>PKR {cartTotal.toLocaleString()}</span>
              </div>
              <DialogFooter>
                <Button className="w-full" onClick={() => { setCartOpen(false); setCheckoutOpen(true); }}>Proceed to Checkout</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Checkout Dialog */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Checkout</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Full Name *</Label><Input value={customerForm.name} onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })} /></div>
            <div><Label>Phone Number *</Label><Input value={customerForm.phone} onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })} /></div>
            <div><Label>Email (optional)</Label><Input type="email" value={customerForm.email} onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })} /></div>
            <div><Label>Delivery Address *</Label><Textarea value={customerForm.address} onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })} /></div>
            <div className="border-t border-border pt-3">
              <p className="text-sm text-muted-foreground mb-1">{cart.length} item{cart.length !== 1 ? "s" : ""}</p>
              <p className="font-bold">Total: PKR {cartTotal.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">Cash on Delivery</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCheckoutOpen(false)}>Cancel</Button>
            <Button onClick={handleCheckout} disabled={submitting}>Place Order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6 text-center text-sm text-muted-foreground">
        <p>Powered by <span className="font-display font-bold">Busistree</span></p>
        {settings?.contact_phone && <p className="mt-1">Contact: {settings.contact_phone}</p>}
      </footer>
    </div>
  );
};

export default Storefront;
