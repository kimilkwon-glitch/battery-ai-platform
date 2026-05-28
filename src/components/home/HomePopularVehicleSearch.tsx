import Link from "next/link";
import { HomeSectionShell } from "@/components/common/HomeSectionShell";
import { SectionHeader } from "@/components/common/SectionHeader";
import { CardHorizontalLayout } from "@/components/cards/CardHorizontalLayout";
import {
  CardInfoActions,
  CardInfoCtaLink,
  CardInfoDesc,
  CardInfoSpecBadges,
  CardInfoStack,
  CardInfoTitleRow,
} from "@/components/cards/CardHorizontalInfo";
import { VehicleCardImage } from "@/components/media/VehicleCardImage";
import { HOME_POPULAR_VEHICLES } from "@/lib/home-upgrade-v2-data";
import { bm } from "@/lib/design-tokens";

export function HomePopularVehicleSearch() {
  return (
    <HomeSectionShell rhythm="vehicle" data-section="popular-vehicles">
      <SectionHeader
        label="차량 매칭"
        title="인기 차량 빠른 검색"
        description="연식·연료에 따라 규격이 달라질 수 있습니다 — 카드에서 바로 확인하세요."
        iconKey="vehicle"
      />
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {HOME_POPULAR_VEHICLES.map((v) => (
          <CardHorizontalLayout
            as={Link}
            className={`${bm.cardVehicleMatch} group`}
            href={v.href}
            key={v.slug}
            imagePanel={<VehicleCardImage slug={v.slug} title={v.title} layout="row" />}
          >
            <CardInfoStack>
              <CardInfoTitleRow iconKey="vehicle" title={v.title} />
              <CardInfoSpecBadges spec={v.spec} />
              <CardInfoDesc>{v.hint}</CardInfoDesc>
            </CardInfoStack>
            <CardInfoActions>
              <CardInfoCtaLink>검색·상세 →</CardInfoCtaLink>
            </CardInfoActions>
          </CardHorizontalLayout>
        ))}
      </div>
    </HomeSectionShell>
  );
}
