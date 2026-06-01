import Link from "next/link";
import { BANK_TRANSFER_POLICY, BANK_TRANSFER_POLICY_LINKS } from "@/data/bank-transfer-policy";
import { bm } from "@/lib/design-tokens";

export function CheckoutPolicyNotice() {
  return (
    <section className={`${bm.card} ${bm.cardPad} space-y-4`} id="checkout-policy">
      <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
        <h2 className="text-sm font-black text-slate-900">{BANK_TRANSFER_POLICY.title}</h2>
        <p className="mt-2 text-xs font-medium leading-relaxed text-slate-700">
          {BANK_TRANSFER_POLICY.summary}
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-4 text-[11px] font-medium text-slate-600">
          {BANK_TRANSFER_POLICY.notices.slice(0, 3).map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
        <Link
          href={BANK_TRANSFER_POLICY_LINKS.orderGuide}
          className={`${bm.btnTertiary} mt-3 inline-flex text-xs`}
        >
          자세히 보기 →
        </Link>
      </div>
      <p className="text-[10px] font-medium text-slate-500">
        실제 입금 확인·자동 취소는 주문 시스템 연동 후 적용됩니다. 현재는 안내용 정책입니다.
      </p>
    </section>
  );
}
