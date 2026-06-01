"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CART_PAGE } from "@/lib/customer-center-routes";
import { CART_UPDATED_EVENT, getCartItems } from "@/lib/cart/cart-storage";
import { useBatteryCartOptional } from "@/components/cart/BatteryCartProvider";

export function CartHeaderLink() {
  const ctx = useBatteryCartOptional();
  const [count, setCount] = useState(0);

  useEffect(() => {
    const sync = () => {
      const items = ctx?.items ?? getCartItems();
      setCount(items.reduce((s, i) => s + i.quantity, 0));
    };
    sync();
    window.addEventListener(CART_UPDATED_EVENT, sync);
    return () => window.removeEventListener(CART_UPDATED_EVENT, sync);
  }, [ctx?.items]);

  return (
    <Link
      href={CART_PAGE}
      className="relative inline-flex size-9 shrink-0 items-center justify-center rounded-full text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-900 sm:size-10"
      aria-label={count > 0 ? `장바구니 ${count}개` : "장바구니"}
      title="장바구니"
    >
      <span aria-hidden className="text-base leading-none sm:text-lg">
        🛒
      </span>
      {count > 0 ? (
        <span className="min-w-[1.125rem] rounded-full bg-blue-600 px-1 text-center text-[9px] font-black leading-4 text-white">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}
