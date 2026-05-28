import Link from "next/link";
import { AppIcon } from "@/components/common/AppIcon";
import { HomeSectionShell } from "@/components/common/HomeSectionShell";
import { SectionHeader } from "@/components/common/SectionHeader";
import { CardHorizontalLayout } from "@/components/cards/CardHorizontalLayout";
import {
  CardInfoActions,
  CardInfoBadgeRow,
  CardInfoDesc,
  CardInfoMeta,
  CardInfoStack,
  CardInfoTitleRow,
} from "@/components/cards/CardHorizontalInfo";
import { BatteryCardImage } from "@/components/media/BatteryCardImage";
import { HUB_PHOTO } from "@/lib/customer-hub-routes";
import {
  HOME_POPULAR_BATTERIES,
  batteryDetailHref,
} from "@/lib/home-upgrade-v2-data";
import { bm } from "@/lib/design-tokens";

export function HomePopularBatteryRanking() {
  return (
    <HomeSectionShell rhythm="catalog" id="home-popular-batteries" data-section="popular-batteries">
      <SectionHeader
        label="규격 허브"
        title="많이 찾는 배터리 규격"
        description="DB에 등록된 대표 규격 — 상세 허브에서 차량·비교·오주문 방지를 확인하세요."
        iconKey="batterySpec"
      />
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {HOME_POPULAR_BATTERIES.map((item) => (
          <CardHorizontalLayout
            as="article"
            className={bm.cardBatteryProduct}
            key={item.code}
            imagePanel={
              <BatteryCardImage code={item.code} flushTop layout="row" />
            }
          >
            <CardInfoStack>
              <CardInfoTitleRow
                iconKey="batterySpec"
                title={item.code}
                titleClassName="spec-code text-[var(--bm-text)]"
              />
              <CardInfoDesc>{item.summary}</CardInfoDesc>
              <CardInfoBadgeRow>
                <span className={`${bm.badge} ${bm.badgeGray}`}>{item.typeLabel}</span>
                <span className={`${bm.badge} ${bm.badgeGray}`}>{item.terminal}</span>
              </CardInfoBadgeRow>
              <CardInfoMeta>{item.useCase}</CardInfoMeta>
            </CardInfoStack>
            <CardInfoActions>
              <Link className={`${bm.btnCardNavy} inline-flex items-center gap-1`} href={batteryDetailHref(item.code)}>
                <AppIcon iconKey="batterySpec" size="xs" className="!text-white" />
                규격 상세
              </Link>
              <Link className={`${bm.btnCardGhost} inline-flex items-center gap-1`} href={HUB_PHOTO}>
                <AppIcon iconKey="photoCheck" size="xs" />
                사진확인
              </Link>
            </CardInfoActions>
          </CardHorizontalLayout>
        ))}
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
        <AppIcon iconKey="battery" size="sm" />
        상품 이미지는 좌측 크게 · 규격 정보는 우측에 정리됩니다.
      </p>
    </HomeSectionShell>
  );
}
