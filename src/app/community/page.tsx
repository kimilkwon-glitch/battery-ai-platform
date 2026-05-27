import { Breadcrumb } from "@/components/portal";
import { PageShell } from "@/components/common/PageShell";
import { SmartNextActions } from "@/components/common/SmartNextActions";
import { CommunityClient } from "@/components/platform/CommunityClient";
import { buildContextFromSearch } from "@/lib/navigationGraph";

export default async function CommunityPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;

  return (
    <PageShell pageLabel="배터리 Q&A" showSearch searchPlaceholder="차종, 규격, 증상으로 질문 검색" wide={false}>
      <Breadcrumb items={[{ label: "홈", href: "/" }, { label: "Q&A" }]} />
      <CommunityClient initialQ={q} />
      <SmartNextActions context={buildContextFromSearch(q ?? "AGM80L")} limit={4} />
    </PageShell>
  );
}
