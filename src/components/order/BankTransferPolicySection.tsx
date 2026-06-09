import Link from "next/link";
import { BankTransferNotice } from "@/components/order/BankTransferNotice";
import { PaymentDeadlineBadge } from "@/components/order/PaymentDeadlineBadge";
import {
  BANK_TRANSFER_CHECKLIST,
  BANK_TRANSFER_MESSAGE_LINKS,
  BANK_TRANSFER_POLICY,
  BANK_TRANSFER_POLICY_LINKS,
  messageGuideUrlForTemplate,
} from "@/data/bank-transfer-policy";
import { bm } from "@/lib/design-tokens";

export function BankTransferPolicySection() {
  return (
    <div className="space-y-4" data-component="bank-transfer-policy-section" id="bank-transfer">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-base font-black text-slate-950">무통장 입금 주문 안내</h2>
        <PaymentDeadlineBadge />
      </div>

      <BankTransferNotice variant="compact" showCtas={false} />

      <section className={`${bm.card} ${bm.cardPad}`}>
        <h3 className="text-sm font-black text-slate-900">입금 전 확인 체크리스트</h3>
        <ol className="mt-3 list-none space-y-2 p-0">
          {BANK_TRANSFER_CHECKLIST.map((item) => (
            <li
              key={item.step}
              className="flex gap-3 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5"
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[11px] font-black text-white">
                {item.step}
              </span>
              <div>
                <p className="text-xs font-black text-slate-900">{item.title}</p>
                <p className="mt-0.5 text-xs font-medium text-slate-600">{item.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <p className="rounded-lg border border-amber-100 bg-amber-50/80 px-3 py-2.5 text-xs font-bold leading-relaxed text-amber-950">
        주의: {BANK_TRANSFER_POLICY.caution[0]}
      </p>
      <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-bold leading-relaxed text-slate-700">
        자동 취소: {BANK_TRANSFER_POLICY.cancellationRule}
      </p>

      <section className={`${bm.card} ${bm.cardPad}`}>
        <h3 className="text-sm font-black text-slate-900">연결된 안내 메시지 예시</h3>
        <p className="mt-1 text-xs font-medium text-slate-500">
          주문·결제 안내 시 아래와 같은 형식으로 연락드립니다.
        </p>
        <ul className="mt-3 flex flex-col gap-2">
          {BANK_TRANSFER_MESSAGE_LINKS.map((link) => (
            <li key={link.templateId}>
              <Link
                href={messageGuideUrlForTemplate(link.templateId)}
                className="text-xs font-bold text-blue-700 hover:underline"
              >
                {link.label} →
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-wrap gap-2">
        <Link className={`${bm.btnNavy} text-xs`} href={BANK_TRANSFER_POLICY_LINKS.orderCompleteDemo}>
          주문 완료 안내
        </Link>
        <Link className={`${bm.btnSecondary} text-xs`} href={BANK_TRANSFER_POLICY_LINKS.messageGuide}>
          결제 안내 메시지 전체
        </Link>
      </div>
    </div>
  );
}
