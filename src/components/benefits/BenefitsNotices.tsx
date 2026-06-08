import clsx from "clsx";

const NOTICE_ITEMS = [
  "혜택 조건·적용 여부는 상품·차량·운영 정책에 따라 달라질 수 있습니다.",
  "회원가입 첫 주문 3% 혜택은 로그인 후 첫 주문 시 자동으로 적용됩니다.",
  "로그인 후 주문 조건에 맞는 혜택은 자동으로 적용됩니다.",
  "쿠폰코드가 있는 혜택은 주문서에서 입력해 사용할 수 있습니다.",
  "회원 혜택과 쿠폰은 주문 조건에 따라 결제금액에 반영됩니다.",
  "일부 혜택은 조건 확인 후 상담 시 안내됩니다.",
] as const;

export function BenefitsNotices({ className }: { className?: string }) {
  return (
    <section
      className={clsx("home-benefit-notices rounded-xl border border-slate-200/80 bg-slate-50/40 px-4 py-3 sm:px-5 sm:py-3.5", className)}
      aria-label="유의사항"
    >
      <h2 className="text-xs font-black text-slate-800">유의사항</h2>
      <ul className="home-benefit-notices__list mt-2 space-y-1.5 text-[11px] font-medium leading-relaxed text-slate-600 sm:text-xs">
        {NOTICE_ITEMS.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-[0.35em] size-1 shrink-0 rounded-full bg-slate-400" aria-hidden />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
