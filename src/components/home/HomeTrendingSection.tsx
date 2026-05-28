import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { HomeSectionShell } from "@/components/common/HomeSectionShell";
import { SectionHeader } from "@/components/common/SectionHeader";
import { HOME_TRENDING_PATTERNS } from "@/lib/home-upgrade-v2-data";
import { bm } from "@/lib/design-tokens";

export function HomeTrendingSection() {
  return (
    <HomeSectionShell rhythm="symptom" data-section="trending">
      <SectionHeader
        label="검색 패턴"
        title="많이 찾는 조건 · 자주 헷갈리는 규격"
        description="실시간 통계가 아닌, 자주 확인되는 대표 검색 조건입니다."
      />
      <div className="mt-3 flex flex-wrap gap-2">
        {HOME_TRENDING_PATTERNS.map((item) => (
          <Link
            className="inline-flex flex-col rounded-xl border border-amber-100/80 bg-white px-3 py-2 shadow-sm transition motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-amber-200 motion-safe:hover:shadow-md"
            href={item.href}
            key={item.label}
          >
            <span className={`${bm.badge} ${bm.badgeAmber} mb-1 w-fit`}>{item.tag}</span>
            <span className="text-xs font-bold text-slate-900">{item.label}</span>
          </Link>
        ))}
      </div>
      <Link
        className={`${bm.alertWarn} mt-3 flex items-center gap-2 transition hover:border-amber-300`}
        href="/symptoms"
      >
        <span className="bm-icon-pill bm-icon-pill--amber" aria-hidden>
          <AlertTriangle className="size-3.5" strokeWidth={2.5} />
        </span>
        <span className="text-xs font-semibold text-amber-950">
          증상(방전·시동지연)부터 확인 → 증상 진단 허브
        </span>
      </Link>
    </HomeSectionShell>
  );
}
