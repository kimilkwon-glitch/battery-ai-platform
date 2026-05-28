import Link from "next/link";
import { SectionHeader } from "@/components/common/SectionHeader";
import { MediaImageSlot } from "@/components/media/MediaImageSlot";
import { HUB_PHOTO } from "@/lib/customer-hub-routes";
import {
  HOME_POPULAR_BATTERIES,
  batteryDetailHref,
} from "@/lib/home-upgrade-v2-data";
import { HOME_IMAGE_SLOTS } from "@/lib/media/image-slot-registry";
import { bm } from "@/lib/design-tokens";

export function HomePopularBatteryRanking() {
  return (
    <section
      id="home-popular-batteries"
      className={`${bm.sectionBlock} ${bm.sectionBlockPad}`}
      data-home-section="popular-batteries"
    >
      <SectionHeader
        label="규격 허브"
        title="많이 찾는 배터리 규격"
        description="DB에 등록된 대표 규격 — 상세 허브에서 차량·비교·오주문 방지를 확인하세요."
      />
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {HOME_POPULAR_BATTERIES.map((item) => (
          <article className={`${bm.rankCard} flex flex-col`} key={item.code}>
            <div className="p-2.5">
              <MediaImageSlot
                slot={HOME_IMAGE_SLOTS.batteryRank(item.code)}
                className="!h-[120px] sm:!h-[130px]"
              />
            </div>
            <div className="flex flex-1 flex-col gap-2 border-t border-slate-100 px-3 pb-3 pt-2">
              <p className="spec-code text-base font-bold text-[var(--bm-text)]" data-spec-code>
                {item.code}
              </p>
              <p className="text-xs font-medium leading-relaxed text-slate-600">{item.summary}</p>
              <div className="flex flex-wrap gap-1">
                <span className={`${bm.badge} ${bm.badgeGray}`}>{item.typeLabel}</span>
                <span className={`${bm.badge} ${bm.badgeGray}`}>{item.terminal}</span>
              </div>
              <p className="text-[10px] font-medium text-slate-500">{item.useCase}</p>
              <div className="mt-auto flex flex-wrap gap-2 pt-1">
                <Link className={`${bm.btnNavy} text-[10px]`} href={batteryDetailHref(item.code)}>
                  규격 상세
                </Link>
                <Link className={`${bm.btnGhost} text-[10px]`} href={HUB_PHOTO}>
                  사진확인
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
