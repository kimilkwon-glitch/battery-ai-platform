"use client";

import { BATTERY_NO_RETURN_FEE, formatPriceWon } from "@/lib/pricing/order-price";
import type { UsedBatteryFormSelection } from "@/lib/order-request/order-request-form-helpers";
import type { OrderRequestUsedBatteryOption } from "@/types/order-request";

type Props = {
  value: UsedBatteryFormSelection;
  allowChange?: boolean;
  onChange?: (v: "return" | "no_return") => void;
};

export function CheckoutBatteryReturnSummary({ value, allowChange, onChange }: Props) {
  if (allowChange && onChange) {
    return (
      <div className="checkout-return-summary space-y-2 rounded-xl border border-slate-200 bg-slate-50/80 p-3">
        <p className="text-xs font-black text-slate-800">폐배터리 반납 여부</p>
        <p className="text-[11px] font-medium text-slate-600">
          선택한 값이 주문 합계와 결제금액에 반영됩니다.
        </p>
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: "return" as const, label: "반납", fee: "추가금 없음" },
              {
                id: "no_return" as const,
                label: "미반납",
                fee: `+${formatPriceWon(BATTERY_NO_RETURN_FEE)}`,
              },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={`rounded-xl px-4 py-2.5 text-left text-xs font-black ${
                value === opt.id
                  ? "bg-slate-900 text-white ring-2 ring-slate-400"
                  : "bg-white text-slate-800 ring-1 ring-slate-200 hover:ring-slate-300"
              }`}
            >
              <span className="block">{opt.label}</span>
              <span
                className={`mt-0.5 block text-[10px] font-bold ${
                  value === opt.id ? "text-blue-100" : "text-slate-500"
                }`}
              >
                {opt.fee}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const isReturn = value === "return";
  const isNoReturn = value === "no_return";

  return (
    <div className="checkout-return-summary rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5">
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
        <dt className="font-bold text-slate-500">폐배터리 반납</dt>
        <dd className="font-black text-slate-900">
          {isReturn ? "반납" : isNoReturn ? "미반납" : "—"}
        </dd>
        <dt className="font-bold text-slate-500">추가금</dt>
        <dd
          className={`font-black tabular-nums ${
            isNoReturn ? "text-red-600" : "text-slate-900"
          }`}
        >
          {isReturn ? "없음" : isNoReturn ? `+${formatPriceWon(BATTERY_NO_RETURN_FEE)}` : "—"}
        </dd>
      </dl>
    </div>
  );
}
