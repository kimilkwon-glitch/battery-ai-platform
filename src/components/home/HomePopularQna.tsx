import Link from "next/link";
import { HomeSectionShell } from "@/components/common/HomeSectionShell";
import { SectionHeader } from "@/components/common/SectionHeader";
import { RelatedQnaSection } from "@/components/qna/RelatedQnaSection";
import { bm } from "@/lib/design-tokens";
import { getHomeFeaturedQuestions } from "@/lib/qna";
import { searchHref } from "@/lib/platform-data";

export function HomePopularQna() {
  const featured = getHomeFeaturedQuestions(5);

  return (
    <HomeSectionShell rhythm="qna" data-section="home-popular-qna">
      <div className="border-b border-slate-200/80 pb-4">
        <SectionHeader
          label="자주 묻는 질문"
          title="많이 헷갈리는 질문만 먼저 모았습니다"
          description="포터2 90R/100R, 블랙박스 방전, EV 12V, AGM 차이처럼 주문 전에 막히는 질문입니다."
          iconKey="qna"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <Link className={`${bm.btnGhost} text-[10px]`} href={searchHref("포터2 배터리")}>
            포터2 검색
          </Link>
          <Link className={`${bm.btnGhost} text-[10px]`} href={searchHref("레이 블랙박스 방전")}>
            방전 증상
          </Link>
          <Link className={`${bm.btnGhost} text-[10px]`} href="/community">
            Q&A 전체
          </Link>
        </div>
      </div>
      <div className="pt-4">
        <RelatedQnaSection
          title="추천 Q&A"
          description=""
          questions={featured}
          hubHref="/community"
        />
      </div>
    </HomeSectionShell>
  );
}
