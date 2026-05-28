import Link from "next/link";
import { SectionHeader } from "@/components/common/SectionHeader";
import { MediaImageSlot } from "@/components/media/MediaImageSlot";
import { HOME_POPULAR_VEHICLES } from "@/lib/home-upgrade-v2-data";
import { HOME_IMAGE_SLOTS } from "@/lib/media/image-slot-registry";
import { bm } from "@/lib/design-tokens";

export function HomePopularVehicleSearch() {
  return (
    <section className={`${bm.card} ${bm.cardPad}`} data-home-section="popular-vehicles">
      <SectionHeader
        label="차량 매칭"
        title="인기 차량 빠른 검색"
        description="연식·연료에 따라 규격이 달라질 수 있습니다 — 카드에서 바로 확인하세요."
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {HOME_POPULAR_VEHICLES.map((v) => (
          <Link
            className={`${bm.cardInteractive} flex flex-col overflow-hidden`}
            href={v.href}
            key={v.slug}
          >
            <div className="p-2">
              <MediaImageSlot slot={HOME_IMAGE_SLOTS.vehicleQuick(v.slug, v.title)} />
            </div>
            <div className="flex flex-1 flex-col gap-1 border-t border-slate-100 p-3">
              <p className="text-sm font-bold text-slate-950">{v.title}</p>
              <p className="text-[10px] font-semibold text-blue-700">{v.spec}</p>
              <p className="text-xs font-medium leading-relaxed text-slate-600">{v.hint}</p>
              <span className="mt-2 text-[10px] font-bold text-blue-600">검색·상세 →</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
