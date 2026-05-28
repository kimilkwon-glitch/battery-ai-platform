import Link from "next/link";
import { HomeSectionShell } from "@/components/common/HomeSectionShell";
import { SectionHeader } from "@/components/common/SectionHeader";
import { MediaImageSlot } from "@/components/media/MediaImageSlot";
import { HOME_TRENDING_PATTERNS } from "@/lib/home-upgrade-v2-data";
import { HOME_IMAGE_SLOTS } from "@/lib/media/image-slot-registry";
import { bm } from "@/lib/design-tokens";

export function HomeTrendingSection() {
  return (
    <HomeSectionShell rhythm="symptom" data-section="trending">
      <SectionHeader
        label="검색 패턴"
        title="많이 찾는 조건 · 자주 헷갈리는 규격"
        description="실시간 통계가 아닌, 자주 확인되는 대표 검색 조건입니다."
      />
      <div className="grid gap-4 lg:grid-cols-[1fr_minmax(200px,280px)]">
        <div className="flex flex-wrap gap-2">
          {HOME_TRENDING_PATTERNS.map((item) => (
            <Link
              className={`${bm.cardSymptom} inline-flex flex-col px-3 py-2 transition motion-safe:hover:-translate-y-0.5`}
              href={item.href}
              key={item.label}
            >
              <span className={`${bm.badge} ${bm.badgeGray} mb-1 w-fit`}>{item.tag}</span>
              <span className="text-xs font-bold text-slate-800">{item.label}</span>
            </Link>
          ))}
        </div>
        <div>
          <p className="mb-1.5 text-[10px] font-bold text-slate-500">증상 검색 참고</p>
          <MediaImageSlot slot={HOME_IMAGE_SLOTS.symptomBlackbox()} />
        </div>
      </div>
    </HomeSectionShell>
  );
}
