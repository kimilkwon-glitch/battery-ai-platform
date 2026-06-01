import Link from "next/link";
import {
  BANK_TRANSFER_POLICY,
  BANK_TRANSFER_POLICY_LINKS,
} from "@/data/bank-transfer-policy";
import { PaymentDeadlineBadge } from "@/components/order/PaymentDeadlineBadge";
import { bm } from "@/lib/design-tokens";

type Props = {
  variant?: "compact" | "full";
  showCtas?: boolean;
};

export function BankTransferNotice({ variant = "full", showCtas = true }: Props) {
  const policy = BANK_TRANSFER_POLICY;

  if (variant === "compact") {
    return (
      <div
        className="rounded-xl border border-amber-100 bg-amber-50/50 px-4 py-3"
        data-component="bank-transfer-notice-compact"
      >
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-black text-amber-950">{policy.title}</p>
          <PaymentDeadlineBadge />
        </div>
        <p className="mt-2 text-xs font-medium leading-relaxed text-amber-900/90">
          {policy.summary}
        </p>
      </div>
    );
  }

  return (
    <section
      className={`${bm.card} ${bm.cardPad} border-amber-100/90 bg-gradient-to-br from-white to-amber-50/25`}
      data-component="bank-transfer-notice"
    >
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-base font-black text-slate-950">{policy.title}</h3>
        <PaymentDeadlineBadge />
      </div>
      <p className="mt-3 text-sm font-medium leading-relaxed text-slate-700">{policy.summary}</p>
      <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">{policy.customerGuide}</p>

      <ul className="mt-4 list-none space-y-2 p-0">
        {policy.notices.map((item) => (
          <li
            key={item}
            className="rounded-lg border border-slate-100 bg-white/80 px-3 py-2 text-xs font-medium text-slate-700"
          >
            {item}
          </li>
        ))}
      </ul>

      <p className="mt-4 rounded-lg border border-amber-200/80 bg-amber-50 px-3 py-2.5 text-xs font-bold leading-relaxed text-amber-950">
        {policy.caution[0]}
      </p>
      <p className="mt-2 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-xs font-bold leading-relaxed text-slate-700">
        {policy.cancellationRule}
      </p>

      {showCtas ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <Link className={`${bm.btnNavy} text-xs`} href={BANK_TRANSFER_POLICY_LINKS.orderGuide}>
            입금 안내 확인
          </Link>
          <Link className={`${bm.btnSecondary} text-xs`} href={`${BANK_TRANSFER_POLICY_LINKS.customerHub}?tab=inquiry`}>
            고객센터 문의
          </Link>
          <Link className={`${bm.btnTertiary} text-xs`} href={BANK_TRANSFER_POLICY_LINKS.mypage}>
            주문 내역 확인
          </Link>
        </div>
      ) : null}
    </section>
  );
}
