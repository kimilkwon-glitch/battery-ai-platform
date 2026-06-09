/** 자동차 배터리 + 말풍선 SVG (휴대폰 배터리 아이콘 대체) */
export function BatteryTalkCarIcon({ className = "size-6" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/* 말풍선 */}
      <path
        d="M17.5 2.5a3 3 0 0 1 3 3v5.5a3 3 0 0 1-3 3h-2.2l-2.3 2.3a.75.75 0 0 1-1.28-.53V14H6.5a3 3 0 0 1-3-3V5.5a3 3 0 0 1 3-3h11Z"
        fill="currentColor"
        opacity="0.18"
      />
      {/* 배터리 본체 */}
      <rect x="3" y="8" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      {/* + 단자 */}
      <rect x="17" y="11" width="2.5" height="4" rx="0.5" fill="currentColor" />
      {/* - 단자 */}
      <rect x="1.5" y="11.5" width="1.5" height="3" rx="0.25" fill="currentColor" />
      {/* + 표시 */}
      <path d="M8.5 11v4M6.5 13h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      {/* - 표시 */}
      <path d="M12.5 13h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
