import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ShoppingCart, Minus, Plus, PackageSearch, Store } from "lucide-react";
import { toast } from "sonner";
import SEO from "@/components/SEO";
import { useStoreCart } from "@/hooks/useStoreCart";

const ProductPage = () => {
  const { slug, productSlug } = useParams<{ slug: string; productSlug: string }>();
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const { addToCart, cartCount } = useStoreCart(slug);

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
      const { data } = await (supabase as any)
        .from("public_store_settings")
        .select("*")
        .eq("store_id", store!.id)
        .maybeSingle();
      return data;
    },
  });

  const { data: product, isLoading: productLoading, isError: productError } = useQuery({
    queryKey: ["storefront-product", store?.id, productSlug],
    enabled: !!store && !!productSlug,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name, slug)")
        .eq("store_id", store!.id)
        .eq("slug", productSlug!)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: related } = useQuery({
    queryKey: ["storefront-related", store?.id, product?.category_id, product?.id],
    enabled: !!store && !!product,
    queryFn: async () => {
      let q = supabase
        .from("products")
        .select("id, name, slug, price, images")
        .eq("store_id", store!.id)
        .eq("is_active", true)
        .neq("id", product!.id)
        .limit(4);
      if (product!.category_id) q = q.eq("category_id", product!.category_id);
      const { data } = await q;
      return data || [];
    },
  });

  const primaryColor = (settings?.primary_color as string) || "#16a34a";
  const images = useMemo(() => (product?.images as string[] | undefined) || [], [product]);

  if (storeLoading || productLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Skeleton className="h-6 w-40 mb-6" />
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="aspect-square w-full" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (storeError || !store) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="rounded-full bg-muted p-4 inline-flex mb-4">
            <Store className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold font-display mb-2">Store Not Found</h1>
          <p className="text-muted-foreground">This store doesn't exist or is not currently active.</p>
        </div>
      </div>
    );
  }

  if (productError || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="rounded-full bg-muted p-4 inline-flex mb-4">
            <PackageSearch className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold font-display mb-2">Product Not Found</h1>
          <p className="text-muted-foreground mb-6">
            We couldn't find this product. It may have been removed or is no longer available.
          </p>
          <Button asChild>
            <Link to={`/shop/${slug}`}>Back to store</Link>
          </Button>
        </div>
      </div>
    );
  }

  const inStock = (product.stock ?? 0) > 0;
  const price = Number(product.price);
  const compareAt = product.compare_at_price ? Number(product.compare_at_price) : null;
  const seoDesc =
    (product.description as string | undefined)?.slice(0, 155) ||
    `${product.name} — available at ${store.name}. Order online with cash on delivery.`;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || undefined,
    image: images,
    offers: {
      "@type": "Offer",
      priceCurrency: "PKR",
      price,
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  const handleAdd = () => {
    addToCart(product, qty);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${product.name} — ${store.name}`}
        description={seoDesc}
        path={`/shop/${slug}/product/${product.slug}`}
        jsonLd={productJsonLd}
      />

      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to={`/shop/${slug}`} className="flex items-center gap-3 min-w-0">
            {settings?.logo_url && (
              <img src={settings.logo_url} alt="" className="h-8 w-8 rounded object-contain" />
            )}
            <h1 className="text-xl font-bold font-display truncate" style={{ color: primaryColor }}>
              {store.name}
            </h1>
          </Link>
          <Button variant="outline" className="relative" asChild>
            <Link to={`/shop/${slug}`}>
              <ShoppingCart className="h-4 w-4 mr-2" aria-hidden="true" /> Cart
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-muted-foreground flex items-center gap-1">
          <Link to={`/shop/${slug}`} className="hover:text-foreground inline-flex items-center">
            <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Back to {store.name}
          </Link>
        </nav>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Gallery */}
          <div>
            <div className="aspect-square bg-muted rounded-lg overflow-hidden border border-border">
              {images.length > 0 ? (
                <img
                  src={images[activeImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No image
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="mt-3 grid grid-cols-5 gap-2">
                {images.map((src, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    aria-label={`Show image ${i + 1}`}
                    className={`aspect-square rounded-md overflow-hidden border-2 transition ${
                      i === activeImage ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-5">
            {(product as any).categories?.name && (
              <Badge variant="outline">{(product as any).categories.name}</Badge>
            )}
            <h1 className="text-3xl md:text-4xl font-bold font-display">{product.name}</h1>

            <div className="flex items-end gap-3">
              <span className="text-3xl font-bold" style={{ color: primaryColor }}>
                PKR {price.toLocaleString()}
              </span>
              {compareAt && compareAt > price && (
                <span className="text-lg text-muted-foreground line-through">
                  PKR {compareAt.toLocaleString()}
                </span>
              )}
              {compareAt && compareAt > price && (
                <Badge variant="secondary">
                  Save {Math.round(((compareAt - price) / compareAt) * 100)}%
                </Badge>
              )}
            </div>

            <div>
              {inStock ? (
                <Badge variant="secondary">In stock ({product.stock} available)</Badge>
              ) : (
                <Badge variant="destructive">Out of stock</Badge>
              )}
            </div>

            {product.description && (
              <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line">
                {product.description}
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Quantity</span>
              <div className="flex items-center border border-border rounded-md">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" aria-hidden="true" />
                </Button>
                <span className="w-10 text-center text-sm" aria-live="polite">
                  {qty}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setQty((q) => Math.min(product.stock || 99, q + 1))}
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button size="lg" className="flex-1" disabled={!inStock} onClick={handleAdd}>
                <ShoppingCart className="h-4 w-4 mr-2" aria-hidden="true" />
                {inStock ? "Add to Cart" : "Out of Stock"}
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to={`/shop/${slug}`}>Continue shopping</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Related */}
        {related && related.length > 0 && (
          <section className="mt-14">
            <h2 className="text-xl font-bold font-display mb-4">You may also like</h2>
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
              {related.map((r: any) => (
                <Link
                  key={r.id}
                  to={`/shop/${slug}/product/${r.slug}`}
                  className="group border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="aspect-square bg-muted">
                    {(r.images as string[])?.[0] ? (
                      <img
                        src={(r.images as string[])[0]}
                        alt={r.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium truncate">{r.name}</h3>
                    <p className="text-sm font-bold mt-1" style={{ color: primaryColor }}>
                      PKR {Number(r.price).toLocaleString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      <footer className="border-t border-border mt-12 py-6 text-center text-sm text-muted-foreground">
        <p>
          Powered by <span className="font-display font-bold">Busistree</span>
        </p>
      </footer>
    </div>
  );
};

export default ProductPage;
