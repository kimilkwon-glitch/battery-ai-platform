import Link from "next/link";
import { HomeSectionShell } from "@/components/common/HomeSectionShell";
import { SectionHeader } from "@/components/common/SectionHeader";
import { CrossLinkCard } from "@/components/portal";
import { bm } from "@/lib/design-tokens";
import { PLATFORM_HUB_LINKS } from "@/lib/platform-hub-routes";

export function HomePlatformTools() {
  return (
    <HomeSectionShell rhythm="tools" data-section="platform-tools">
      <SectionHeader
        label="안내 모음"
        title="검색·비교·증상·주문 전 확인"
        description="차종 검색부터 규격 비교, 증상 안내, 사진 확인, 매장·택배 안내까지 한 흐름으로 연결됩니다."
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
    </HomeSectionShell>
  );
}
