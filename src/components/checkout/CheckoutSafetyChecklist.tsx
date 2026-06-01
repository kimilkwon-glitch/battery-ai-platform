"use client";

import Link from "next/link";
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
    setChecked((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      const complete = requiredIds.every((rid) => next[rid]);
      onAllRequiredCheckedChange?.(complete);
      return next;
    });
  };

  return (
    <section className={`${bm.card} ${bm.cardPad}`} id="checkout-safety-checklist">
      <h2 className="text-sm font-black text-slate-900">주문 전 체크리스트</h2>
      <p className="mt-1 text-xs font-medium text-slate-500">
        아래 항목을 확인한 뒤 주문을 진행해 주세요.
      </p>
      <ul className="mt-3 space-y-2">
        {CHECKOUT_CHECKLIST_ITEMS.map((item) => {
          const isChecked = !!checked[item.id];
          return (
            <li key={item.id}>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-3 transition hover:bg-white has-[:checked]:border-blue-200 has-[:checked]:bg-blue-50/30">
                <input
                  type="checkbox"
                  className="mt-0.5 size-5 shrink-0 rounded border-slate-300 accent-blue-600"
                  checked={isChecked}
                  onChange={() => toggle(item.id)}
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-black text-slate-800">{item.label}</span>
                  {item.description ? (
                    <span className="mt-0.5 block text-[11px] font-medium text-slate-500">
                      {item.description}
                    </span>
                  ) : null}
                  {item.relatedLink ? (
                    <Link
                      href={item.relatedLink}
                      className="mt-1 inline-block text-[10px] font-bold text-blue-700 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      관련 안내 보기 →
                    </Link>
                  ) : null}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
      {!allRequiredChecked ? (
        <p className="mt-3 text-[11px] font-bold text-amber-800">
          {CHECKOUT_PAGE_COPY.proceedBlockedHint}
        </p>
      ) : null}
    </section>
  );
}
