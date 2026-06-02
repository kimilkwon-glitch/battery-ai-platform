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
        label="차량 검색"
        title="인기 차량 빠른 검색"
        description="같은 차종도 연식·연료에 따라 배터리가 달라질 수 있습니다."
        iconKey="vehicle"
      />
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {HOME_POPULAR_VEHICLES.map((v) => (
          <CardHorizontalLayout
            as={Link}
            className={`${bm.cardVehicleMatch} group`}
            href={v.href}
            key={v.slug}
            imagePanel={<VehicleCardImage slug={v.slug} title={v.title} />}
          >
            <CardInfoStack>
              <CardInfoTitleRow iconKey="vehicle" title={v.title} />
              <CardInfoSpecBadges spec={v.spec} />
              <CardInfoDesc>{v.hint}</CardInfoDesc>
            </CardInfoStack>
            <CardInfoActions>
              <CardInfoCtaLink>이 차 기준으로 보기 →</CardInfoCtaLink>
            </CardInfoActions>
          </CardHorizontalLayout>
        ))}
      </div>
    </HomeSectionShell>
  );
}
