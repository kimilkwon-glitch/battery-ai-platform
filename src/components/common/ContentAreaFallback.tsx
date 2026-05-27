/** Suspense fallback — 고객 화면에 "로딩…" 문구 없이 레이아웃만 유지 */
export function ContentAreaFallback({ lines = 3 }: { lines?: number }) {
  return (
    <div className="animate-pulse space-y-3 py-6" aria-busy="true" aria-label="콘텐츠 불러오는 중">
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className={`rounded-xl bg-slate-100/90 ${i === 0 ? "h-10 w-2/3 max-w-sm" : "h-16 w-full"}`}
        />
      ))}
    </div>
  );
}
