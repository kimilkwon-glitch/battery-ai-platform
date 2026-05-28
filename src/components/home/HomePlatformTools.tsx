import Link from "next/link";
import { SectionHeader } from "@/components/common/SectionHeader";
import { CrossLinkCard } from "@/components/portal";
import { bm } from "@/lib/design-tokens";
import { PLATFORM_HUB_LINKS } from "@/lib/platform-hub-routes";

export function HomePlatformTools() {
  return (
    <section className={`${bm.sectionBlock} ${bm.sectionBlockPad}`} data-home-section="platform-tools">
      <SectionHeader
        label="플랫폼 허브"
        title="배터리 매칭 플랫폼 전체 도구"
        description="검색·비교·증상·오주문 방지·사진 확인·매장 안내를 한 흐름으로 연결합니다."
      />
      <div className="mt-4 grid auto-rows-fr gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PLATFORM_HUB_LINKS.map((link) => (
          <CrossLinkCard key={link.href} {...link} />
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link className={`${bm.btnNavy} text-xs`} href="/search?q=포터2">
          차종 검색 예시
        </Link>
        <Link className={`${bm.btnGhost} text-xs`} href="/vehicles">
          차량 목록
        </Link>
      </div>
    </section>
  );
}
