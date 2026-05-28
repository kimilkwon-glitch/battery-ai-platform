import Link from "next/link";
import { RelatedQnaSection } from "@/components/qna/RelatedQnaSection";
import { bm } from "@/lib/design-tokens";
import { getHomeFeaturedQuestions } from "@/lib/qna";
import { QNA_IMAGE_SLOTS } from "@/lib/media/image-slot-registry";
import { searchHref } from "@/lib/platform-data";

export function HomePopularQna() {
  const featured = getHomeFeaturedQuestions(5);

  return (
    <section className={`${bm.card} overflow-hidden`} data-section="home-popular-qna">
      <div className={`${bm.cardPad} border-b border-slate-100`}>
        <p className="text-[10px] font-black uppercase tracking-[0.08em] text-blue-600">자주 묻는 질문</p>
        <h2 className="font-heading mt-1 text-lg font-black tracking-[-0.02em] text-slate-950">
          규격·연식·방전 — 바로 답 찾기
        </h2>
        <p className="mt-1 text-xs font-medium text-slate-500">
          포터2 90R/100R, 블랙박스 방전, EV 12V, AGM 차이, CMF80L 검색까지 한곳에서 연결합니다.
        </p>
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
      <div className={bm.cardPad}>
        <RelatedQnaSection
          title="추천 Q&A"
          description=""
          questions={featured}
          imageSlot={QNA_IMAGE_SLOTS.blackboxCheck()}
          hubHref="/community"
        />
      </div>
    </section>
  );
}
