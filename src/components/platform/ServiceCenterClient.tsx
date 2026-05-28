"use client";

import Link from "next/link";
import { ServiceStoreVisualCard } from "@/components/service/ServiceStoreVisualCard";
import {
  BUSAN_CAPABILITIES,
  BUSAN_SERVICE_CTAS,
  BUSAN_STORES,
  CONSULT_PREP_ITEMS,
  STORE_HUB_SECTIONS,
} from "@/lib/busan-service-hub-data";
import { HUB_PHOTO, HUB_STORE } from "@/lib/customer-hub-routes";
import { bm } from "@/lib/design-tokens";

export function ServiceCenterClient({
  vehicleLabel,
  battery,
  symptom,
}: {
  vehicleLabel?: string;
  battery?: string;
  symptom?: string;
}) {
  const context = [vehicleLabel, battery, symptom].filter(Boolean);

  return (
    <div className="space-y-5">
      <section className={`${bm.heroPanel} p-5`} id="hub-overview">
        <p className="text-[11px] font-black uppercase tracking-wide text-blue-600">매장·출장</p>
        <h2 className="mt-1 text-xl font-black text-slate-950">덕천점 · 학장점 · 출장·내방 안내</h2>
        <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-slate-600">
          오프라인 고객을 위해 직영점 안내, 출장 가능 지역, 내방 교체, 교체 상담을 이 페이지에서
          확인할 수 있습니다. 부산 지역은 가까운 직영점 기준으로 일정 맞춰 안내드립니다.
        </p>
        <p className="mt-2 text-xs font-semibold text-slate-600">
          차량명·연식·현재 장착 배터리 사진을 보내주시면 더 정확히 확인할 수 있습니다.
        </p>
        {context.length > 0 ? (
          <p className="mt-2 text-xs font-bold text-blue-700">연결 정보: {context.join(" · ")}</p>
        ) : null}
        <nav className="mt-4 flex flex-wrap gap-1.5" aria-label="매장·출장 섹션">
          {STORE_HUB_SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="rounded-full bg-white px-3 py-1.5 text-[10px] font-black text-slate-700 ring-1 ring-slate-200 hover:bg-blue-50 hover:text-blue-700"
            >
              {s.label}
            </a>
          ))}
        </nav>
      </section>

      <section className={`${bm.card} ${bm.cardPad}`} id="stores">
        <h3 className="text-base font-black text-slate-950">1. 덕천점 · 학장점 직영점 안내</h3>
        <p className="mt-1 text-xs font-semibold text-slate-500">
          직영점 안내 · 부산 배터리 교체 가능 지역의 기준 지점입니다.
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {BUSAN_STORES.map((store) => (
            <ServiceStoreVisualCard
              detailHref={`#store-${store.id}`}
              key={store.id}
              store={store}
            />
          ))}
        </div>
      </section>

      <section className={`${bm.card} ${bm.cardPad}`} id="regions">
        <h3 className="text-base font-black text-slate-950">2. 출장 가능 지역</h3>
        <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-600">
          출장/내방 가능 지역은 덕천점·학장점 권역을 기준으로 안내합니다. 북구·사상권 외 지역은
          사전 문의 후 일정을 조율합니다.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {BUSAN_STORES.map((store) => (
            <div
              className="rounded-xl bg-slate-50/80 p-3 ring-1 ring-slate-100"
              key={store.id}
            >
              <p className="text-sm font-black text-slate-900">{store.name}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {store.areas.map((area) => (
                  <span
                    key={area}
                    className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-slate-700 ring-1 ring-slate-200"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={`${bm.card} ${bm.cardPad}`} id="visit">
        <h3 className="text-base font-black text-slate-950">3. 내방 교체 안내</h3>
        <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-600">
          차량을 직영점으로 가져오시면 현장에서 규격·단자 방향을 확인한 뒤 교체를 진행합니다.
          예약 없이 방문 가능한 경우도 있으나, 혼잡 시간대에는 문의 후 방문을 권장합니다.
        </p>
      </section>

      <section className={`${bm.card} ${bm.cardPad}`} id="consult-prep">
        <h3 className="text-base font-black text-slate-950">4. 상담 전 준비사항</h3>
        <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-600">
          교체 상담 시 아래 정보를 준비해 주시면 상담 시간을 줄일 수 있습니다.
        </p>
        <ul className="mt-3 list-inside list-disc space-y-1 text-sm font-medium text-slate-700">
          {CONSULT_PREP_ITEMS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className={`${bm.card} ${bm.cardPad}`} id="photo-guide">
        <h3 className="text-base font-black text-slate-950">5. 사진으로 규격 확인 안내</h3>
        <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-600">
          배터리 라벨·단자 방향(L/R) 사진으로 규격을 먼저 확인한 뒤 매장·출장 일정을 안내하는 것이
          안전합니다.
        </p>
        <Link className={`${bm.btnNavy} mt-4 inline-flex text-xs`} href={HUB_PHOTO}>
          사진으로 확인
        </Link>
      </section>

      <section className={`${bm.card} ${bm.cardPad}`} id="contact">
        <h3 className="text-base font-black text-slate-950">6. 문의하기</h3>
        <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-600">
          연식·연료·ISG/BMS 여부에 따라 맞는 규격이 달라질 수 있습니다. 확실하지 않으면 현재 배터리
          라벨·단자 사진을 먼저 보내 주세요.
        </p>
        <div className="mt-3">
          <h4 className="text-sm font-black text-slate-800">가능 작업</h4>
          <ul className="mt-2 grid gap-2 sm:grid-cols-2">
            {BUSAN_CAPABILITIES.map((item) => (
              <li className="flex items-start gap-2 text-sm font-semibold text-slate-700" key={item}>
                <span className="mt-1.5 shrink-0 text-blue-600" aria-hidden>
                  ·
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {BUSAN_SERVICE_CTAS.map((cta) => (
            <Link
              key={cta.label}
              className={
                cta.primary
                  ? `${bm.btnPrimary} inline-flex min-h-[44px] items-center justify-center text-center text-xs`
                  : "inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-center text-xs font-black text-slate-800 shadow-sm hover:border-blue-200 hover:bg-blue-50"
              }
              href={cta.href}
            >
              {cta.label}
            </Link>
          ))}
        </div>
        <p className="mt-3 text-[10px] font-medium text-slate-500">
          이전 메뉴(직영점 안내·출장/내방·교체 상담·부산 가능 지역)는 모두 {HUB_STORE} 로
          연결됩니다.
        </p>
      </section>
    </div>
  );
}
