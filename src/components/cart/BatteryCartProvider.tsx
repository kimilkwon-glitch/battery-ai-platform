"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  addCartItem as storageAdd,
  clearCart as storageClear,
  getCartItems,
  getCartSummary,
  removeCartItem as storageRemove,
  updateCartItem as storageUpdate,
  CART_STORAGE_KEY,
  CART_UPDATED_EVENT,
} from "@/lib/cart/cart-storage";
import type { BatteryCartItem, BatteryCartSummary } from "@/types/cart";

type BatteryCartCtx = {
  items: BatteryCartItem[];
  summary: BatteryCartSummary;
  hydrated: boolean;
  addItem: (item: BatteryCartItem) => void;
  updateItem: (itemId: string, patch: Partial<BatteryCartItem>) => void;
  removeItem: (itemId: string) => void;
  clear: () => void;
  refresh: () => void;
};

const BatteryCartContext = createContext<BatteryCartCtx | null>(null);

export function BatteryCartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<BatteryCartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const refresh = useCallback(() => {
    setItems(getCartItems());
  }, []);

  useEffect(() => {
    refresh();
    setHydrated(true);
    const onUpdate = () => refresh();
    const onFocus = () => refresh();
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === CART_STORAGE_KEY) refresh();
    };
    window.addEventListener(CART_UPDATED_EVENT, onUpdate);
    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, onUpdate);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onStorage);
    };
  }, [refresh]);

  const addItem = useCallback(
    (item: BatteryCartItem) => {
      const next = storageAdd(item);
      setItems(next);
    },
    [],
  );

  const updateItem = useCallback((itemId: string, patch: Partial<BatteryCartItem>) => {
    const next = storageUpdate(itemId, patch);
    setItems(next);
  }, []);

  const removeItem = useCallback((itemId: string) => {
    const next = storageRemove(itemId);
    setItems(next);
  }, []);

  const clear = useCallback(() => {
    storageClear();
    setItems([]);
  }, []);

  const summary = useMemo(() => getCartSummary(items), [items]);

  const value = useMemo(
    () => ({
      items,
      summary,
      hydrated,
      addItem,
      updateItem,
      removeItem,
      clear,
      refresh,
    }),
    [items, summary, hydrated, addItem, updateItem, removeItem, clear, refresh],
  );

  return (
    <BatteryCartContext.Provider value={value}>{children}</BatteryCartContext.Provider>
  );
}

export function useBatteryCart() {
  const ctx = useContext(BatteryCartContext);
  if (!ctx) throw new Error("useBatteryCart requires BatteryCartProvider");
  return ctx;
}

export function useBatteryCartOptional() {
  return useContext(BatteryCartContext);
}
