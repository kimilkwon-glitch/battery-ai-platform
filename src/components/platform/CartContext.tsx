"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ShopProduct } from "@/lib/platform-data";

export type CartItem = { productId: string; qty: number };

type CartCtx = {
  items: CartItem[];
  add: (product: ShopProduct) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  count: number;
};

const CartContext = createContext<CartCtx | null>(null);
const KEY = "batteryai-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const add = useCallback((product: ShopProduct) => {
    setItems((prev) => {
      const ex = prev.find((i) => i.productId === product.id);
      if (ex) return prev.map((i) => (i.productId === product.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { productId: product.id, qty: 1 }];
    });
  }, []);

  const remove = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const setQty = useCallback((productId: string, qty: number) => {
    setItems((prev) =>
      qty <= 0 ? prev.filter((i) => i.productId !== productId) : prev.map((i) => (i.productId === productId ? { ...i, qty } : i)),
    );
  }, []);

  const count = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items]);

  return <CartContext.Provider value={{ items, add, remove, setQty, count }}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart requires CartProvider");
  return ctx;
}
