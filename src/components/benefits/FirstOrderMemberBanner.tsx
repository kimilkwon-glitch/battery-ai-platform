/** 회원가입 첫 주문 3% — 이미지 대신 상단 고정 문구 배너 (할인 로직은 유지) */
export function FirstOrderMemberBanner({ className = "" }: { className?: string }) {
  return (
    <div
      className={`first-order-member-banner rounded-xl bg-gradient-to-r from-blue-600 via-blue-600 to-blue-700 px-4 py-3 shadow-sm sm:px-5 sm:py-3.5 ${className}`}
      role="note"
      aria-label="신규회원가입 혜택 안내"
      data-benefit-banner="first-order-3"
    >
      <p className="text-center text-sm font-black leading-snug sm:text-base">
        <span className="text-slate-950">신규회원가입 혜택!</span>
        <span className="mx-1.5 text-white/70" aria-hidden>
          ·
        </span>
        <span className="text-white">가입 축하금 3% 할인</span>
      </p>
    </div>
  );
}
