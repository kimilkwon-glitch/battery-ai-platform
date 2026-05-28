import Link from "next/link";
import { AppIcon } from "@/components/common/AppIcon";
import { HomeSectionShell } from "@/components/common/HomeSectionShell";
import { SectionHeader } from "@/components/common/SectionHeader";
import { CardHorizontalLayout } from "@/components/cards/CardHorizontalLayout";
import {
  CardInfoActions,
  CardInfoBadgeRow,
  CardInfoStack,
  CardInfoTitleRow,
} from "@/components/cards/CardHorizontalInfo";
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
        iconKey="ev"
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
            <CardInfoStack>
              <CardInfoTitleRow iconKey="ev" title={item.label} />
              <CardInfoBadgeRow>
                <span className={`${bm.badge} ${bm.badgeBlue}`}>{item.battery}</span>
              </CardInfoBadgeRow>
            </CardInfoStack>
            <CardInfoActions>
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
              ) : null}
            </CardInfoActions>
          </CardHorizontalLayout>
        ))}
      </div>
      <Link className={`${bm.btnGhost} mt-3 inline-flex items-center gap-1.5 text-xs`} href={HUB_PHOTO}>
        <AppIcon iconKey="photoCheck" size="sm" />
        EV·HEV 보조배터리 사진 확인
      </Link>
    </HomeSectionShell>
  );
}
