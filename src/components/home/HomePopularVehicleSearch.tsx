import Link from "next/link";
import { AppIcon } from "@/components/common/AppIcon";
import { HomeSectionShell } from "@/components/common/HomeSectionShell";
import { SectionHeader } from "@/components/common/SectionHeader";
import { CardHorizontalLayout } from "@/components/cards/CardHorizontalLayout";
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
            <div className="flex items-start gap-2">
              <span className="bm-icon-pill shrink-0" aria-hidden>
                <AppIcon iconKey="vehicle" size="sm" strokeWidth={2.5} />
              </span>
              <p className="text-base font-bold text-slate-900 group-hover:text-blue-800">{v.title}</p>
            </div>
            <p className="spec-code text-xs font-bold text-blue-700" data-spec-code>
              {v.spec}
            </p>
            <p className="line-clamp-2 text-xs font-medium leading-relaxed text-slate-700">{v.hint}</p>
            <span className="text-[10px] font-bold text-slate-500">검색·상세 →</span>
          </CardHorizontalLayout>
        ))}
      </div>
    </HomeSectionShell>
  );
}
