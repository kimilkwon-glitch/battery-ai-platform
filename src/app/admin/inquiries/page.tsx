"use client";

import { useCallback, useEffect, useState } from "react";
import {
  deleteInquiry,
  listInquiries,
  updateInquiryStatus,
  type InquiryRecord,
  type InquiryStatus,
} from "@/lib/inquiry-storage";
import { AdminPageNav } from "@/components/admin/AdminPageNav";
import { ADMIN_ROUTES } from "@/lib/admin/admin-nav";
import { bm } from "@/lib/design-tokens";

/**
 * 운영자 상담 인박스 — localStorage 기반 (브라우저별·임시).
 * URL 직접 접근만 가능. 인증·보안 없음 → 운영용 보안·DB 연동 필요.
 */
export default function AdminInquiriesPage() {
  const [rows, setRows] = useState<InquiryRecord[]>([]);

  const refresh = useCallback(() => setRows(listInquiries()), []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-bold text-amber-800">
          운영용 임시 화면 — localStorage 저장·보안 없음. Supabase 등 DB 연동 권장.
        </p>
        <AdminPageNav />
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-black text-slate-950">상담 접수 목록</h1>
          <a href={ADMIN_ROUTES.orderRequests} className="text-xs font-bold text-blue-700 hover:underline">
            상담 주문 요청 →
          </a>
        </div>
        <button type="button" onClick={refresh} className={`${bm.btnSecondary} mt-4 text-xs`}>
          새로고침
        </button>

        {rows.length === 0 ? (
          <p className="mt-8 text-sm font-medium text-slate-500">접수된 상담이 없습니다.</p>
        ) : (
          <ul className="mt-6 space-y-4">
            {rows.map((row) => (
              <li key={row.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-mono text-slate-400">{row.id}</span>
                  <select
                    value={row.status}
                    onChange={(e) => {
                      updateInquiryStatus(row.id, e.target.value as InquiryStatus);
                      refresh();
                    }}
                    className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold"
                  >
                    <option value="new">신규</option>
                    <option value="reviewed">확인</option>
                    <option value="done">완료</option>
                  </select>
                </div>
                <p className="mt-2 text-sm font-black text-slate-900">
                  {row.name} · {row.contact}
                  {row.source ? (
                    <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-black text-slate-600">
                      {row.source === "support" ? "고객센터" : "채팅"}
                    </span>
                  ) : null}
                </p>
                {row.inquiryType ? (
                  <p className="text-xs font-bold text-slate-500">유형: {row.inquiryType}</p>
                ) : null}
                <p className="text-xs text-slate-500">{new Date(row.createdAt).toLocaleString("ko-KR")}</p>
                {row.batteryCode ? (
                  <p className="mt-1 text-xs font-bold text-blue-700">규격: {row.batteryCode}</p>
                ) : null}
                {row.vehicle ? <p className="text-xs font-semibold text-slate-600">차량: {row.vehicle}</p> : null}
                {row.couponCode ? (
                  <p className="mt-1 font-mono text-xs font-black text-amber-800">쿠폰: {row.couponCode}</p>
                ) : null}
                <p className="mt-2 text-sm font-medium text-slate-700">{row.message}</p>
                {row.pageUrl ? (
                  <p className="mt-1 truncate text-[10px] text-slate-400">{row.pageUrl}</p>
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    deleteInquiry(row.id);
                    refresh();
                  }}
                  className="mt-3 text-[11px] font-bold text-red-600 hover:underline"
                >
                  삭제
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
