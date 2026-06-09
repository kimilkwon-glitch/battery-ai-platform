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
  const [showDetail, setShowDetail] = useState(false);

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
    <section className={`${bm.card} ${bm.cardPad}`} id="checkout-safety-checklist" data-checkout-section="safety">
      <h2 className="text-sm font-black text-slate-900">주문 전 확인</h2>
      <p className="mt-1 text-xs font-medium text-slate-500">{CHECKOUT_PAGE_COPY.checklistIntro}</p>
      <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-[11px] font-medium leading-relaxed text-slate-600 ring-1 ring-slate-100">
        {CHECKOUT_PAGE_COPY.fitmentNote}
      </p>
      <button
        type="button"
        className="mt-2 text-[11px] font-bold text-blue-700 hover:underline"
        onClick={() => setShowDetail((v) => !v)}
      >
        {showDetail ? "안내 접기" : "자세한 안내 보기"}
      </button>
      {showDetail ? (
        <p className="mt-1 text-[10px] font-medium leading-relaxed text-slate-500">
          L/R 단자 방향, 폐배터리 반납 조건, 차량별 예외 규격은 주문 전 한 번 더 확인해 주세요.
        </p>
      ) : null}
      <ul className="mt-3 space-y-2">
        {CHECKOUT_CHECKLIST_ITEMS.map((item) => (
          <li key={item.id}>
            <label className="flex min-h-[2.75rem] cursor-pointer items-start gap-2.5 rounded-xl border border-slate-200 px-3 py-2.5 has-[:checked]:border-blue-200 has-[:checked]:bg-blue-50/30">
              <input
                type="checkbox"
                className="mt-0.5 size-4 shrink-0 accent-blue-600"
                checked={!!checked[item.id]}
                onChange={() => toggle(item.id)}
              />
              <span className="min-w-0 flex-1 text-xs font-bold leading-snug text-slate-800">{item.label}</span>
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}
