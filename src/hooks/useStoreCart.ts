import { useCallback, useEffect, useState } from "react";

export interface CartItem {
  product: any;
  quantity: number;
}

const key = (slug: string) => `busistree:cart:${slug}`;

const read = (slug: string): CartItem[] => {
  try {
    const raw = localStorage.getItem(key(slug));
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
};

export function useStoreCart(slug: string | undefined) {
  const [cart, setCart] = useState<CartItem[]>(() => (slug ? read(slug) : []));

  useEffect(() => {
    if (!slug) return;
    setCart(read(slug));
    const onStorage = (e: StorageEvent) => {
      if (e.key === key(slug)) setCart(read(slug));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    localStorage.setItem(key(slug), JSON.stringify(cart));
  }, [cart, slug]);

  const addToCart = useCallback((product: any, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i,
        );
      }
      return [...prev, { product, quantity }];
    });
  }, []);

  const updateQty = useCallback((productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.product.id === productId ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i,
        )
        .filter((i) => i.quantity > 0),
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartTotal = cart.reduce((s, i) => s + Number(i.product.price) * i.quantity, 0);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  return { cart, setCart, addToCart, updateQty, clearCart, cartTotal, cartCount };
}
