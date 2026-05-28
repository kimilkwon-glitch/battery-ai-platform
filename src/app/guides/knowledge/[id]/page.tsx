import { notFound } from "next/navigation";
import { PageShell } from "@/components/common/PageShell";
import { ContentGuideDetail } from "@/components/battery/ContentGuideDetail";
import { getContentGuide } from "@/data/battery/contentGuides";

export const dynamic = "force-dynamic";

export default async function GuideKnowledgePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const guide = getContentGuide(id);
  if (!guide) notFound();

  return (
    <PageShell pageLabel="배터리 기본 안내" title={guide.title} description={guide.hook}>
      <ContentGuideDetail guide={guide} />
    </PageShell>
  );
}
