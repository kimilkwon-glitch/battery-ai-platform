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
          title="규격·연식·방전 — 바로 답 찾기"
          description="포터2 90R/100R, 블랙박스 방전, EV 12V, AGM 차이, CMF80L 검색까지 한곳에서 연결합니다."
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <Link className={`${bm.btnGhost} text-[10px]`} href={searchHref("포터2 배터리")}>
            포터2 검색
          </Link>
          <Link className={`${bm.btnGhost} text-[10px]`} href={searchHref("레이 블랙박스 방전")}>
            방전 증상
          </Link>
          <Link className={`${bm.btnGhost} text-[10px]`} href="/community">
            질문 허브
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
