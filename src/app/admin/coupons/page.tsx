"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  deleteCoupon,
  listCoupons,
  updateCouponMeta,
  type CouponRecord,
  type CouponStatus,
} from "@/lib/coupon-storage";
import { bm } from "@/lib/design-tokens";

/**
 * 쿠폰 관리 임시 화면 — localStorage 동일 브라우저만 조회 가능.
 * 운영용: DB·관리자 인증·서버 발급 API 필요.
 */
export default function AdminCouponsPage() {
  const [rows, setRows] = useState<CouponRecord[]>([]);

  const refresh = useCallback(() => setRows(listCoupons()), []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-bold text-amber-800">
          운영용 임시 화면 — localStorage 저장·보안 없음. 이 브라우저에서 발급된 쿠폰만 표시됩니다. DB 연동·인증
          필요.
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-black text-slate-950">쿠폰 발급 목록</h1>
          <Link href="/admin/inquiries" className="text-xs font-bold text-blue-700 hover:underline">
            ← 상담 목록
          </Link>
        </div>
        <button type="button" onClick={refresh} className={`${bm.btnSecondary} mt-4 text-xs`}>
          새로고침
        </button>

        {rows.length === 0 ? (
          <p className="mt-8 text-sm font-medium text-slate-500">
            발급된 쿠폰이 없습니다. 고객 화면에서 쿠폰 발급 후 이 브라우저에서 확인할 수 있습니다.
          </p>
        ) : (
          <ul className="mt-6 space-y-4">
            {rows.map((row) => (
              <li key={row.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-lg font-black text-slate-900">{row.code}</span>
                  <select
                    value={row.status}
                    onChange={(e) => {
                      updateCouponMeta(row.code, { status: e.target.value as CouponStatus });
                      refresh();
                    }}
                    className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold"
                  >
                    <option value="unused">미사용</option>
                    <option value="used">사용완료</option>
                  </select>
                </div>
                <p className="mt-1 text-sm font-bold text-slate-700">{row.benefitName}</p>
                <p className="text-xs text-slate-500">
                  발급 {new Date(row.issuedAt).toLocaleString("ko-KR")}
                </p>
                <label className="mt-3 block text-xs font-bold text-slate-600">
                  고객 이름
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm font-semibold"
                    defaultValue={row.customerName ?? ""}
                    onBlur={(e) => {
                      updateCouponMeta(row.code, { customerName: e.target.value.trim() || undefined });
                      refresh();
                    }}
                  />
                </label>
                <label className="mt-2 block text-xs font-bold text-slate-600">
                  연락처
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm font-semibold"
                    defaultValue={row.customerContact ?? ""}
                    onBlur={(e) => {
                      updateCouponMeta(row.code, {
                        customerContact: e.target.value.trim() || undefined,
                      });
                      refresh();
                    }}
                  />
                </label>
                <label className="mt-2 block text-xs font-bold text-slate-600">
                  메모
                  <textarea
                    className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm font-semibold"
                    rows={2}
                    defaultValue={row.memo ?? ""}
                    onBlur={(e) => {
                      updateCouponMeta(row.code, { memo: e.target.value.trim() || undefined });
                      refresh();
                    }}
                  />
                </label>
                <button
                  type="button"
                  className="mt-3 text-xs font-bold text-red-600 hover:underline"
                  onClick={() => {
                    if (confirm("이 쿠폰 기록을 삭제할까요?")) {
                      deleteCoupon(row.code);
                      refresh();
                    }
                  }}
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
