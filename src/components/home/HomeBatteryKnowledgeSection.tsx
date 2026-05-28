import Link from "next/link";
import { GuideTeaserCard } from "@/components/battery/GuideTeaserCard";
import { listContentGuideTeasers } from "@/data/battery/contentGuides";
import { SectionHeader } from "@/components/common/SectionHeader";
import { bm } from "@/lib/design-tokens";

const HOME_TEASER_COUNT = 4;

export function HomeBatteryKnowledgeSection() {
  const teasers = listContentGuideTeasers().slice(0, HOME_TEASER_COUNT);

  return (
    <section className={`${bm.card} ${bm.cardPad}`}>
      <SectionHeader
        label="배터리 기본 안내"
        title="교체 전에 알면 좋은 기본 지식"
        description="메인에서는 요약만 보여드립니다. 전체 안내는 가이드에서 확인하세요."
      />
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {teasers.map((g) => (
          <GuideTeaserCard guide={g} key={g.id} />
        ))}
      </div>
      <Link className={`${bm.btnSecondary} mt-4 inline-flex text-xs`} href="/guides#battery-knowledge">
        기본 안내 10개 모두 보기 →
      </Link>
    </section>
  );
}
