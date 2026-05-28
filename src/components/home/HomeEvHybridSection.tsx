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
        description="전기차·하이브리드는 보조 12V 배터리 확인이 중요합니다. EV 12V와 AGM60L은 쓰임이 다릅니다."
        iconKey="ev"
      />
      <div className={`${bm.alertInfo} mb-4`}>
        <p className="text-sm font-medium text-slate-800">
          전기차도 12V 배터리 때문에 시동·전장 문제가 생길 수 있습니다.
        </p>
        <p className="mt-1 text-xs text-slate-700">
          하이브리드는 메인이 아니라 보조 12V부터 보세요. EV 12V와 AGM60L은 비슷해 보여도 다를 수 있습니다.
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
            <CardInfoActions className="gap-1.5 sm:gap-2">
              <Link className={bm.btnCardSecondary} href={item.href}>
                이 규격으로 보기
              </Link>
              <Link className={`${bm.btnCardGhost} hidden sm:inline-flex`} href={batteryDetailHref(item.battery)}>
                {item.battery} 상세
              </Link>
              {"fuel" in item && item.fuel ? (
                <Link
                  className={`${bm.btnCardGhost} hidden sm:inline-flex`}
                  href={buildVehicleDetailHref(item.vehicleSlug, item.fuel)}
                >
                  차량 기준 보기
                </Link>
              ) : null}
            </CardInfoActions>
          </CardHorizontalLayout>
        ))}
      </div>
      <Link className={`${bm.btnGhost} mt-3 inline-flex items-center gap-1.5 text-xs`} href={HUB_PHOTO}>
        <AppIcon iconKey="photoCheck" size="sm" />
        사진으로 확인
      </Link>
    </HomeSectionShell>
  );
}
