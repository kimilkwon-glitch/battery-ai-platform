import Link from "next/link";
import { PageShell } from "@/components/common/PageShell";
import { BatteryGuidePostsHub } from "@/components/guide/BatteryGuidePostsHub";
import { GUIDE_HUB_ITEMS } from "@/lib/guide-hub-routes";
import { bm } from "@/lib/design-tokens";

export default function GuideSymptomsPage() {
  return (
    <PageShell
      zone="guide"
      pageLabel="배터리 가이드"
      title="방전·증상 가이드"
      description="시동 지연, 방전, 경고등 등 증상별 확인 방법입니다."
    >
      <div className="space-y-6">
        <nav className="flex flex-wrap gap-2">
          {GUIDE_HUB_ITEMS.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="bm-badge bm-badge--guide px-3 py-1.5 hover:opacity-90"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <BatteryGuidePostsHub category="symptom" />
      </div>
    </PageShell>
  );
}
