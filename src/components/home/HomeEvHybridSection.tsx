import Link from "next/link";
import { SectionHeader } from "@/components/common/SectionHeader";
import { BatteryCardImage } from "@/components/media/BatteryCardImage";
import { buildVehicleDetailHref } from "@/lib/battery-cta";
import { HUB_PHOTO } from "@/lib/customer-hub-routes";
import { HOME_EV_HYBRID_ITEMS, batteryDetailHref } from "@/lib/home-upgrade-v2-data";
import { bm } from "@/lib/design-tokens";

export function HomeEvHybridSection() {
  return (
    <section className={`${bm.card} ${bm.cardPad}`} data-home-section="ev-hybrid">
      <SectionHeader
        label="보조 12V"
        title="전기차·하이브리드 보조배터리"
        description="고전압 메인 배터리가 아닙니다. 보조 12V 위치와 규격(EV 12V · AGM60L)을 구분해 확인하세요."
      />
      <div className={`${bm.surfaceMuted} mb-4 px-4 py-3 text-sm font-medium leading-relaxed text-slate-700`}>
        <p>하이브리드/전기차는 차종·연식별로 보조 12V 규격이 다릅니다.</p>
        <p className="mt-1 text-xs text-slate-600">
          EV 12V(전기차 보조)와 AGM60L(하이브리드 보조)을 혼동하지 마세요. 사진으로 최종 확인하면 오주문을 줄일 수
          있습니다.
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {HOME_EV_HYBRID_ITEMS.map((item) => (
          <article className={`${bm.surfaceMuted} flex flex-col overflow-hidden rounded-xl`} key={item.label}>
            <BatteryCardImage code={item.battery} variant="cardCompact" flushTop />
            <div className={`${bm.batteryCardBody} !border-t-0`}>
              <p className="text-sm font-bold leading-snug text-slate-900">{item.label}</p>
              <p className="text-[10px] font-semibold text-[var(--bm-primary)]">
                추천 확인: {item.battery}
              </p>
              <div className={bm.batteryCardBtnRow}>
                <Link className={bm.btnCardSecondary} href={item.href}>
                  검색 결과
                </Link>
                <Link className={bm.btnCardGhost} href={batteryDetailHref(item.battery)}>
                  {item.battery} 상세
                </Link>
                {"fuel" in item && item.fuel ? (
                  <Link
                    className={bm.btnCardGhost}
                    href={buildVehicleDetailHref(item.vehicleSlug, item.fuel)}
                  >
                    차량 상세
                  </Link>
                ) : (
                  <Link
                    className={bm.btnCardGhost}
                    href={buildVehicleDetailHref(item.vehicleSlug)}
                  >
                    차량 상세
                  </Link>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link className={`${bm.btnNavy} text-xs`} href={batteryDetailHref("EV 12V")}>
          EV 12V 상세
        </Link>
        <Link className={`${bm.btnSecondary} text-xs`} href={batteryDetailHref("AGM60L")}>
          AGM60L 상세
        </Link>
        <Link className={`${bm.btnGhost} text-xs`} href={HUB_PHOTO}>
          사진으로 최종 확인
        </Link>
      </div>
    </section>
  );
}
