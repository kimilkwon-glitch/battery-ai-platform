import Link from "next/link";
import { Zap } from "lucide-react";
import { HomeSectionShell } from "@/components/common/HomeSectionShell";
import { SectionHeader } from "@/components/common/SectionHeader";
import { CardHorizontalLayout } from "@/components/cards/CardHorizontalLayout";
import { BatteryCardImage } from "@/components/media/BatteryCardImage";
import { buildVehicleDetailHref } from "@/lib/battery-cta";
import { HUB_PHOTO } from "@/lib/customer-hub-routes";
import { HOME_EV_HYBRID_ITEMS, batteryDetailHref } from "@/lib/home-upgrade-v2-data";
import { bm } from "@/lib/design-tokens";

export function HomeEvHybridSection() {
  return (
    <HomeSectionShell rhythm="ev" data-section="ev-hybrid">
      <SectionHeader
        label="보조 12V"
        title="전기차·하이브리드 보조배터리"
        description="고전압 메인 배터리가 아닙니다. 보조 12V 위치와 규격(EV 12V · AGM60L)을 구분해 확인하세요."
      />
      <div className={`${bm.alertInfo} mb-4`}>
        <p className="text-sm font-medium text-slate-800">
          하이브리드/전기차는 차종·연식별로 보조 12V 규격이 다릅니다.
        </p>
        <p className="mt-1 text-xs text-slate-700">
          EV 12V(전기차 보조)와 AGM60L(하이브리드 보조)을 혼동하지 마세요.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {HOME_EV_HYBRID_ITEMS.map((item) => (
          <CardHorizontalLayout
            as="article"
            className={bm.cardBatteryProduct}
            key={item.label}
            imagePanel={<BatteryCardImage code={item.battery} layout="row" flushTop />}
          >
            <div className="flex items-center gap-1.5">
              <span className="bm-icon-pill bm-icon-pill--emerald shrink-0" aria-hidden>
                <Zap className="size-3.5" strokeWidth={2.5} />
              </span>
              <p className="text-sm font-bold text-slate-900">{item.label}</p>
            </div>
            <p className="text-xs font-semibold text-blue-800">추천 확인: {item.battery}</p>
            <div className={bm.batteryCardBtnRow}>
              <Link className={bm.btnCardSecondary} href={item.href}>
                검색 결과
              </Link>
              <Link className={bm.btnCardGhost} href={batteryDetailHref(item.battery)}>
                {item.battery} 상세
              </Link>
              {"fuel" in item && item.fuel ? (
                <Link className={bm.btnCardGhost} href={buildVehicleDetailHref(item.vehicleSlug, item.fuel)}>
                  차량 상세
                </Link>
              ) : (
                <Link className={bm.btnCardGhost} href={buildVehicleDetailHref(item.vehicleSlug)}>
                  차량 상세
                </Link>
              )}
            </div>
          </CardHorizontalLayout>
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
    </HomeSectionShell>
  );
}
