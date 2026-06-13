/** 회원가입 첫 주문 3% — 사이트 최상단 고정 문구 배너 (할인 로직은 유지) */
export function FirstOrderMemberBanner({ className = "" }: { className?: string }) {
  return (
    <div
      className={`first-order-member-banner px-4 py-3 sm:px-5 sm:py-3.5 ${className}`.trim()}
      role="note"
      aria-label="신규회원가입 혜택 안내"
      data-benefit-banner="first-order-3"
    >
      <p className="text-center text-sm font-black leading-snug sm:text-base">
        <span className="first-order-member-banner__lead">신규회원가입 혜택!</span>
        <span className="first-order-member-banner__dot mx-1.5" aria-hidden>
          ·
        </span>
        <span className="first-order-member-banner__accent">가입 축하금 3% 할인</span>
      </p>
    </div>
  );
}
