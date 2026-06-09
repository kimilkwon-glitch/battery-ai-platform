"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AdminBatteryTalkClient } from "@/components/admin/AdminBatteryTalkClient";
import { AdminInquiriesClient } from "@/components/admin/AdminInquiriesClient";
import { AdminProductQnaClient } from "@/components/admin/AdminProductQnaClient";
import { ADMIN_ROUTES } from "@/lib/admin/admin-nav";
import "@/styles/admin-battery-talk.css";

const TABS = [
  { id: "all", label: "전체" },
  { id: "product", label: "상품 문의" },
  { id: "order", label: "주문 문의" },
  { id: "photo", label: "사진 확인" },
  { id: "consultation", label: "상담 문의" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function HubInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = (searchParams.get("type") as TabId) || "all";
  const setTab = (id: TabId) => {
    const p = new URLSearchParams(searchParams.toString());
    if (id === "all") p.delete("type");
    else p.set("type", id);
    router.replace(`${ADMIN_ROUTES.inquiries}?${p.toString()}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
              tab === t.id ? "bg-slate-900 text-white" : "bg-white text-slate-700 ring-1 ring-slate-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "product" ? (
        <AdminProductQnaClient />
      ) : tab === "consultation" ? (
        <AdminBatteryTalkClient />
      ) : tab === "photo" ? (
        <div className="admin-panel rounded-xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-sm font-bold text-slate-700">사진 확인 요청은 전용 메뉴에서 관리합니다.</p>
          <a href={ADMIN_ROUTES.photoRequests} className="mt-3 inline-block text-sm font-bold text-blue-700 hover:underline">
            사진 확인 요청 바로가기 →
          </a>
        </div>
      ) : (
        <AdminInquiriesClient />
      )}
    </div>
  );
}

export function AdminInquiriesHub() {
  return (
    <Suspense fallback={<p className="text-xs text-slate-500">문의 목록 불러오는 중…</p>}>
      <HubInner />
    </Suspense>
  );
}
