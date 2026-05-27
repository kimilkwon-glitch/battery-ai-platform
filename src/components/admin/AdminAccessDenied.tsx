import { bm } from "@/lib/design-tokens";

export function AdminAccessDenied() {
  return (
    <main className={bm.pageBg}>
      <div className={`${bm.pageContainer} flex min-h-[60vh] items-center justify-center`}>
        <div className={`${bm.card} max-w-md ${bm.cardPad} text-center`}>
          <p className={bm.label}>Battery Manager</p>
          <h1 className="mt-2 text-lg font-black text-slate-950">관리자 전용 페이지입니다</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">접근 권한이 필요합니다.</p>
          <p className="mt-4 text-[11px] font-semibold text-slate-400">
            운영자에게 접근 키를 요청하거나, 올바른 URL로 다시 접속해 주세요.
          </p>
        </div>
      </div>
    </main>
  );
}
