"use client";

import Link from "next/link";
import { useState } from "react";
import { HUB_GUIDE, HUB_SUPPORT } from "@/lib/customer-hub-routes";
import { bm } from "@/lib/design-tokens";

export function PhotoCheckIntakeSection() {
  const [vehicleName, setVehicleName] = useState("");
  const [phone, setPhone] = useState("");
  const [memo, setMemo] = useState("");

  return (
    <div className="space-y-6">
      <section className={`${bm.card} ${bm.cardPad} border-blue-100 bg-gradient-to-br from-white to-blue-50/30`}>
        <h2 className="text-lg font-black text-slate-950">사진으로 배터리 규격 확인</h2>
        <p className="mt-2 text-sm font-medium leading-relaxed text-slate-700">
          배터리 라벨·단자 사진을 보내주시면 규격 확인을 도와드립니다.
        </p>
        <ul className="mt-3 list-inside list-disc space-y-1 text-xs font-semibold text-slate-600">
          <li>배터리 라벨(규격명이 보이는 면) 사진</li>
          <li>단자 방향이 보이는 사진</li>
          <li>차량명·연락처</li>
        </ul>
      </section>

      <section className={`${bm.card} ${bm.cardPad} space-y-4`}>
        <h3 className="text-sm font-black text-slate-900">접수 정보 입력</h3>
        <p className="text-xs font-medium text-slate-500">
          사진 파일 업로드는 준비 중입니다. 아래 정보를 입력하신 뒤 고객센터로 연결해 주세요.
        </p>

        <label className="block space-y-1">
          <span className="text-xs font-bold text-slate-700">차량명</span>
          <input
            type="text"
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium"
            placeholder="예: 싼타페, 포터2, 그랜저"
            value={vehicleName}
            onChange={(e) => setVehicleName(e.target.value)}
          />
        </label>

        <label className="block space-y-1">
          <span className="text-xs font-bold text-slate-700">연락처</span>
          <input
            type="tel"
            inputMode="tel"
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium"
            placeholder="010-0000-0000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </label>

        <label className="block space-y-1">
          <span className="text-xs font-bold text-slate-700">문의 내용 (선택)</span>
          <textarea
            className="min-h-[5rem] w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium"
            placeholder="라벨·단자 사진을 카카오톡/문자로 보내드릴 예정입니다."
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />
        </label>

        <div className="grid gap-2 sm:grid-cols-2">
          <Link
            href={`${HUB_SUPPORT}?tab=inquiry${vehicleName ? `&vehicle=${encodeURIComponent(vehicleName)}` : ""}${phone ? `&phone=${encodeURIComponent(phone)}` : ""}`}
            className={`${bm.btnPrimary} justify-center text-sm font-black`}
          >
            상담 문의하기
          </Link>
          <a
            href="tel:051-123-4567"
            className={`${bm.btnSecondary} justify-center text-sm font-black`}
          >
            고객센터 전화
          </a>
        </div>
      </section>

      <section className={`${bm.card} ${bm.cardPad}`}>
        <h3 className="text-sm font-black text-slate-900">사진 촬영 가이드</h3>
        <p className="mt-1 text-xs font-medium text-slate-500">
          촬영 방법이 궁금하시면 아래 가이드를 참고해 주세요.
        </p>
        <Link
          href={`${HUB_GUIDE}/photo-check`}
          className="mt-3 inline-flex text-xs font-black text-blue-700 hover:underline"
        >
          사진 확인 가이드 보기 →
        </Link>
      </section>
    </div>
  );
}
