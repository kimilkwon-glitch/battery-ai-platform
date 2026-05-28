import Link from "next/link";
import { SectionHeader } from "@/components/common/SectionHeader";
import { BatteryCardImage } from "@/components/media/BatteryCardImage";
import { HUB_PHOTO } from "@/lib/customer-hub-routes";
import {
  HOME_POPULAR_BATTERIES,
  batteryDetailHref,
} from "@/lib/home-upgrade-v2-data";
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
          <article className={`${bm.rankCard} flex flex-col overflow-hidden`} key={item.code}>
            <BatteryCardImage code={item.code} flushTop />
            <div className={bm.batteryCardBody}>
              <p className="spec-code text-base font-bold text-[var(--bm-text)]" data-spec-code>
                {item.code}
              </p>
              <p className="text-[11px] font-medium leading-snug text-slate-600">{item.summary}</p>
              <div className="flex flex-wrap gap-1">
                <span className={`${bm.badge} ${bm.badgeGray}`}>{item.typeLabel}</span>
                <span className={`${bm.badge} ${bm.badgeGray}`}>{item.terminal}</span>
              </div>
              <p className="text-[10px] font-medium leading-snug text-slate-500">{item.useCase}</p>
              <div className={bm.batteryCardBtnRow}>
                <Link className={bm.btnCardNavy} href={batteryDetailHref(item.code)}>
                  규격 상세
                </Link>
                <Link className={bm.btnCardGhost} href={HUB_PHOTO}>
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
