"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CHECKOUT_CHECKLIST_ITEMS,
  CHECKOUT_PAGE_COPY,
} from "@/data/checkout-checklist";
import { bm } from "@/lib/design-tokens";

export function CheckoutSafetyChecklist({
  onAllRequiredCheckedChange,
}: {
  onAllRequiredCheckedChange?: (complete: boolean) => void;
}) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const requiredIds = useMemo(
    () => CHECKOUT_CHECKLIST_ITEMS.filter((i) => i.required).map((i) => i.id),
    [],
  );

  const allRequiredChecked = requiredIds.every((id) => checked[id]);

  useEffect(() => {
    onAllRequiredCheckedChange?.(allRequiredChecked);
  }, [allRequiredChecked, onAllRequiredCheckedChange]);

  const toggle = (id: string) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section className={`${bm.card} ${bm.cardPad}`} id="checkout-safety-checklist">
      <h2 className="text-sm font-black text-slate-900">최종 확인</h2>
      <p className="mt-1 text-xs font-medium text-slate-500">{CHECKOUT_PAGE_COPY.checklistIntro}</p>
      <p className="mt-2 text-[11px] font-medium text-slate-600">{CHECKOUT_PAGE_COPY.fitmentNote}</p>
      <p className="text-[11px] font-medium text-slate-600">{CHECKOUT_PAGE_COPY.usedBatteryNote}</p>
      <ul className="mt-3 space-y-2">
        {CHECKOUT_CHECKLIST_ITEMS.map((item) => (
          <li key={item.id}>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-3 py-2.5 has-[:checked]:border-blue-200 has-[:checked]:bg-blue-50/30">
              <input
                type="checkbox"
                className="size-4 shrink-0 accent-blue-600"
                checked={!!checked[item.id]}
                onChange={() => toggle(item.id)}
              />
              <span className="text-xs font-bold text-slate-800">{item.label}</span>
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}
