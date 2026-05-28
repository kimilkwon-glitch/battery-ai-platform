import Link from "next/link";
import { AppIcon } from "@/components/common/AppIcon";
import { IconBadge } from "@/components/common/IconBadge";
import { HomeSectionShell } from "@/components/common/HomeSectionShell";
import { SectionHeader } from "@/components/common/SectionHeader";
import { HOME_TRENDING_PATTERNS } from "@/lib/home-upgrade-v2-data";
import { TRENDING_TAG_ICONS } from "@/lib/icon-map";
import type { IconKey } from "@/lib/icon-map";
import { bm } from "@/lib/design-tokens";

export function HomeTrendingSection() {
  return (
    <HomeSectionShell rhythm="symptom" data-section="trending">
      <SectionHeader
        label="검색 패턴"
        title="많이 찾는 조건 · 자주 헷갈리는 규격"
        description="자주 확인되는 대표 검색 조건입니다."
        iconKey="trending"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        {HOME_TRENDING_PATTERNS.map((item) => {
          const tagIcon = (TRENDING_TAG_ICONS[item.tag] ?? "search") as IconKey;
          return (
            <Link
              className="inline-flex flex-col rounded-xl border border-amber-100/80 bg-white px-3 py-2 shadow-sm transition motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-amber-200 motion-safe:hover:shadow-md"
              href={item.href}
              key={item.label}
            >
              <span className={`${bm.badge} ${bm.badgeAmber} mb-1 inline-flex w-fit items-center gap-1`}>
                <AppIcon iconKey={tagIcon} size="xs" />
                {item.tag}
              </span>
              <span className="text-sm font-bold text-slate-900">{item.label}</span>
            </Link>
          );
        })}
      </div>
      <Link
        className={`${bm.alertWarn} mt-3 flex items-center gap-2 transition hover:border-amber-300`}
        href="/symptoms"
      >
        <IconBadge iconKey="symptom" tone="amber" />
        <span className="text-sm font-semibold text-amber-950">
          시동·방전 증상부터 보기 → 증상별 안내
        </span>
      </Link>
    </HomeSectionShell>
  );
}
