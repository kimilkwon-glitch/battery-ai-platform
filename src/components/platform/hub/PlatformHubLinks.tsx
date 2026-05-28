import { CrossLinkCard } from "@/components/portal";
import { SectionHeader } from "@/components/common/SectionHeader";
import { bm } from "@/lib/design-tokens";
import { PLATFORM_HUB_LINKS } from "@/lib/platform-hub-routes";

export function PlatformHubLinks({
  title = "플랫폼 허브",
  description = "검색·비교·증상·오주문 방지·사진 확인·매장 안내를 한곳에서 이어갑니다.",
  limit = 6,
}: {
  title?: string;
  description?: string;
  limit?: number;
}) {
  const links = PLATFORM_HUB_LINKS.slice(0, limit);
  return (
    <section className={`${bm.sectionBlock} ${bm.sectionBlockPad}`} data-section="platform-hub-links">
      <SectionHeader title={title} description={description} />
      <div className="mt-4 grid auto-rows-fr gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((link) => (
          <CrossLinkCard key={link.href} {...link} />
        ))}
      </div>
    </section>
  );
}
