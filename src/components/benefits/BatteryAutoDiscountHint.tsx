"use client";

type Props = {
  className?: string;
  /** 결제·주문 단계 — 할인 반영 문구 강조 */
  variant?: "detail" | "checkout";
};

/** 고객 화면용 자동 혜택 안내 — DB promotion 기준, 코드 문자열은 노출하지 않음. */
export function BatteryAutoDiscountHint({ className = "", variant = "detail" }: Props) {
  const lines =
    variant === "checkout"
      ? [
          "로그인 후 주문 조건에 맞는 혜택은 자동으로 적용됩니다.",
          "회원가입 첫 주문 3% 혜택은 별도 코드 입력 없이 주문서에 반영됩니다.",
        ]
      : [
          "회원가입 첫 주문 3% 자동 혜택",
          "로그인 후 첫 주문 시 주문·결제 단계에서 자동 적용",
        ];

  return (
    <ul
      className={`space-y-0.5 rounded-lg border border-emerald-100 bg-emerald-50/50 px-3 py-2 text-[11px] font-semibold text-emerald-950 ${className}`}
      data-auto-discount-hint
    >
      {lines.map((line) => (
        <li key={line} className="flex items-center gap-1.5">
          <span className="text-emerald-600" aria-hidden>
            ✓
          </span>
          {line}
        </li>
      ))}
    </ul>
  );
}
