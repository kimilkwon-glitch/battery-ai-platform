import clsx from "clsx";
import { BANK_TRANSFER_DEADLINE_LABEL, BANK_TRANSFER_POLICY } from "@/data/bank-transfer-policy";

export function PaymentDeadlineBadge({
  hours = BANK_TRANSFER_POLICY.deadlineHours,
  className = "",
}: {
  hours?: number;
  className?: string;
}) {
  const label =
    hours === BANK_TRANSFER_POLICY.deadlineHours
      ? BANK_TRANSFER_DEADLINE_LABEL
      : `주문 후 ${hours}시간 이내 입금 필요`;

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-[11px] font-black text-amber-900 ring-1 ring-amber-200/90",
        className,
      )}
    >
      {label}
    </span>
  );
}
