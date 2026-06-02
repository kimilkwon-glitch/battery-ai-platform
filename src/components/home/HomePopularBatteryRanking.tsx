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
import { batterySpecHref } from "@/lib/canonical-battery-code";
import { HOME_POPULAR_BATTERIES } from "@/lib/home-upgrade-v2-data";
import { getHomeCardCopy } from "@/data/battery/batterySpecIndex";
import { bm } from "@/lib/design-tokens";

export function HomePopularBatteryRanking() {
  return (
    <HomeSectionShell rhythm="catalog" id="home-popular-batteries" data-section="popular-batteries">
      <SectionHeader
        label="인기 규격"
        title="많이 찾는 배터리 규격"
        description="자주 찾는 규격입니다. 단자·차종은 카드에서 확인할 수 있습니다."
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
              <CardInfoDesc className="line-clamp-2">
                {getHomeCardCopy(item.code) ?? item.summary}
              </CardInfoDesc>
              <CardInfoBadgeRow>
                <span className={`${bm.badge} ${bm.badgeGray}`}>{item.typeLabel}</span>
                <span className={`${bm.badge} ${bm.badgeGray}`}>{item.terminal}</span>
              </CardInfoBadgeRow>
              <CardInfoMeta>{item.useCase}</CardInfoMeta>
            </CardInfoStack>
            <CardInfoActions>
              <Link className={`${bm.btnCardNavy} inline-flex items-center gap-1`} href={batterySpecHref(item.code)}>
                <AppIcon iconKey="batterySpec" size="xs" className="!text-white" />
                이 규격 보기
              </Link>
              <Link className={`${bm.btnCardGhost} inline-flex items-center gap-1`} href={HUB_PHOTO}>
                <AppIcon iconKey="photoCheck" size="xs" />
                사진으로 확인
              </Link>
            </CardInfoActions>
          </CardHorizontalLayout>
        ))}
      </div>
      <p className={`mt-3 flex items-center gap-1.5 ${bm.typoCaption}`}>
        <AppIcon iconKey="battery" size="sm" />
        사진은 좌측, 규격 정보는 우측에 정리됩니다.
      </p>
    </HomeSectionShell>
  );
}
