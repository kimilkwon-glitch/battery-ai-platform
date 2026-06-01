"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminPageNav } from "@/components/admin/AdminPageNav";
import { ADMIN_ROUTES } from "@/lib/admin/admin-nav";
import { fetchAdminOrderRequests } from "@/lib/order-request/order-request-client-api";
import { statsFromListItems } from "@/lib/order-request/order-request-admin-stats";
import {
  getOrderRequestSummaryStats,
  listOrderRequestRecords,
} from "@/lib/order-request/order-request-admin-storage";
import { bm } from "@/lib/design-tokens";

export default function AdminHubPage() {
  const [stats, setStats] = useState({
    total: 0,
    needsReview: 0,
    contacted: 0,
    usedBatteryReturn: 0,
    visitInstall: 0,
  });
  const [apiLinked, setApiLinked] = useState(false);

  useEffect(() => {
    void (async () => {
      const res = await fetchAdminOrderRequests();
      if (res.ok && res.items) {
        setStats(statsFromListItems(res.items));
        setApiLinked(true);
        return;
      }
      const records = listOrderRequestRecords();
      setStats(getOrderRequestSummaryStats(records));
      setApiLinked(false);
    })();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <p className="text-xs font-bold text-slate-600">
          Battery Manager 관리 화면 — 세션 인증 후 접근 · 주문 요청 요약은{" "}
          {apiLinked ? "API" : "localStorage(API 실패)"} 기준
        </p>
        <AdminPageNav />
        <h1 className="text-2xl font-black text-slate-950">관리 홈</h1>

        <section>
          <h2 className="text-sm font-black text-slate-800">상담 주문 요청 요약</h2>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {[
              { label: "전체", value: stats.total },
              { label: "확인 필요", value: stats.needsReview },
              { label: "연락 완료", value: stats.contacted },
              { label: "폐전지 반납", value: stats.usedBatteryReturn },
            ].map((c) => (
              <Link
                key={c.label}
                href={ADMIN_ROUTES.orderRequests}
                className={`${bm.cardInteractive} block p-4`}
              >
                <p className="text-xs font-bold text-slate-500">{c.label}</p>
                <p className="text-2xl font-black text-slate-900">{c.value}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2">
          <Link href={ADMIN_ROUTES.orderRequests} className={`${bm.cardInteractive} p-4`}>
            <p className="font-black text-slate-900">상담 주문 요청</p>
            <p className="mt-1 text-xs text-slate-600">장바구니 기반 상담 접수 관리</p>
          </Link>
          <Link href={ADMIN_ROUTES.inquiries} className={`${bm.cardInteractive} p-4`}>
            <p className="font-black text-slate-900">상담 접수</p>
            <p className="mt-1 text-xs text-slate-600">고객센터·채팅 문의</p>
          </Link>
          <Link href={ADMIN_ROUTES.coupons} className={`${bm.cardInteractive} p-4`}>
            <p className="font-black text-slate-900">쿠폰 발급</p>
            <p className="mt-1 text-xs text-slate-600">localStorage 쿠폰 목록</p>
          </Link>
          <Link href={ADMIN_ROUTES.content} className={`${bm.cardInteractive} p-4`}>
            <p className="font-black text-slate-900">콘텐츠</p>
            <p className="mt-1 text-xs text-slate-600">콘텐츠 워크벤치</p>
          </Link>
        </section>
      </div>
    </main>
  );
}
