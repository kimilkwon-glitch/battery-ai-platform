import { Breadcrumb } from "@/components/portal";
import { PageShell } from "@/components/common/PageShell";
import { SmartNextActions } from "@/components/common/SmartNextActions";
import { PlatformHubLinks } from "@/components/platform/hub/PlatformHubLinks";
import { CommunityClient } from "@/components/platform/CommunityClient";
import { BUILD_STAMP } from "@/lib/build-stamp";
import { buildContextFromSearch } from "@/lib/navigationGraph";

export const dynamic = "force-dynamic";

export default async function QaHubPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;

  return (
    <PageShell
      pageLabel="배터리 Q&A"
      searchPlaceholder="차종, 규격, 증상으로 질문 검색"
      wide={false}
      showFooter
    >
      <div data-page="qa-hub" data-build-stamp={BUILD_STAMP}>
        <Breadcrumb items={[{ label: "홈", href: "/" }, { label: "Q&A" }]} />
        <CommunityClient initialQ={q} hubBasePath="/qa" />
        <SmartNextActions context={buildContextFromSearch(q ?? "AGM80L")} limit={4} />
        <PlatformHubLinks title="Q&A 다음 단계" limit={6} />
      </div>
    </PageShell>
  );
}
