"use client";

import { clearLocalActivity } from "@/lib/activity";

export function ActivityDevTools() {
  if (process.env.NODE_ENV === "production") return null;

  return (
    <div className="fixed bottom-3 right-3 z-[200] flex flex-col gap-1 rounded-lg border border-amber-300 bg-amber-50 p-2 shadow-lg">
      <p className="text-[9px] font-black text-amber-900">DEV · Activity</p>
      <button
        className="rounded bg-white px-2 py-1 text-[10px] font-black text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
        onClick={() => {
          clearLocalActivity();
          window.location.reload();
        }}
        type="button"
      >
        local activity 초기화
      </button>
      <p className="max-w-[140px] text-[8px] font-medium text-amber-800">
        mock 재생성: npm run generate:mock-activity
      </p>
    </div>
  );
}
