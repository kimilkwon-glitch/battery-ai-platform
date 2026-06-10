import { Wrench } from "lucide-react";

/** 자동차 배터리(가로형 단자) + 렌치 — 휴대폰 배터리 아이콘 대체 */
export function BatteryTalkCarIcon({ className = "size-6" }: { className?: string }) {
  return (
    <span className={`relative inline-flex shrink-0 items-center justify-center ${className}`} aria-hidden>
      <svg
        className="size-full"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 본체 */}
        <rect x="2" y="7" width="18" height="11" rx="1.75" stroke="currentColor" strokeWidth="1.6" />
        {/* 상단 + 단자 */}
        <rect x="6" y="4" width="3" height="3.5" rx="0.6" fill="currentColor" />
        {/* 상단 - 단자 */}
        <rect x="15" y="4" width="3" height="3.5" rx="0.6" fill="currentColor" />
        {/* + 표시 */}
        <path d="M7.5 11.5v3M6 13h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        {/* - 표시 */}
        <path d="M15.5 13h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
      <Wrench
        className="absolute -bottom-[8%] -right-[10%] size-[42%] stroke-[2.25]"
        aria-hidden
      />
    </span>
  );
}
