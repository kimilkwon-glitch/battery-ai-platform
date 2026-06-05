import { bm } from "@/lib/design-tokens";

export function PaymentPreparingNotice({ compact }: { compact?: boolean }) {
  return (
    <div
      className={`rounded-xl border border-blue-100 bg-blue-50/80 ${compact ? "p-3" : "p-4"} space-y-2`}
      role="status"
      data-payment-preparing
    >
      <p className={`font-black text-blue-950 ${compact ? "text-xs" : "text-sm"}`}>
        현재 자사몰 결제 시스템을 준비 중입니다.
      </p>
      <p className={`font-medium leading-relaxed text-blue-900/90 ${compact ? "text-[11px]" : "text-xs"}`}>
        상품과 결제 예정금액 확인은 가능하며, 결제 기능은 곧 제공될 예정입니다.
      </p>
    </div>
  );
}

export function PaymentPreparingButton({
  disabled,
  onClick,
  loading,
  className = "",
  label = "결제 전 확인하기",
}: {
  disabled?: boolean;
  onClick?: () => void;
  loading?: boolean;
  className?: string;
  label?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      onClick={onClick}
      className={`${bm.btnNavy} w-full justify-center text-sm font-black disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      data-checkout-payment-prep
    >
      {loading ? "확인 중…" : label}
    </button>
  );
}
