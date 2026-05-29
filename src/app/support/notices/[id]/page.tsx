import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/common/PageShell";
import { SupportNoticeImage } from "@/components/support/SupportNoticeImage";
import { getSupportNotice } from "@/lib/support-notices-data";
import { HUB_SUPPORT } from "@/lib/customer-hub-routes";
import { bm } from "@/lib/design-tokens";

export default async function SupportNoticeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const notice = getSupportNotice(id);
  if (!notice) notFound();

  return (
    <PageShell zone="support" pageLabel="공지사항" title={notice.title} searchPlaceholder="차량·규격 검색">
      <article className={`${bm.card} ${bm.cardPad} mx-auto max-w-3xl`}>
        <Link
          href={HUB_SUPPORT}
          className="text-xs font-black text-blue-700 hover:underline"
        >
          ← 공지 목록으로
        </Link>
        <time className="mt-4 block text-sm font-bold text-slate-500">{notice.date}</time>
        <h1 className="mt-2 text-xl font-black text-slate-950 sm:text-2xl">{notice.title}</h1>

        {notice.imageSrc ? (
          <SupportNoticeImage src={notice.imageSrc} alt={notice.imageAlt ?? notice.title} />
        ) : null}

        <div
          className="support-notice-body prose prose-slate mt-6 max-w-none text-sm font-medium text-slate-700 [&_.support-notice-table]:w-full [&_.support-notice-table]:border-collapse [&_.support-notice-table_td]:border [&_.support-notice-table_td]:border-slate-200 [&_.support-notice-table_td]:px-3 [&_.support-notice-table_td]:py-2 [&_.support-notice-table_th]:border [&_.support-notice-table_th]:border-slate-200 [&_.support-notice-table_th]:bg-slate-50 [&_.support-notice-table_th]:px-3 [&_.support-notice-table_th]:py-2 [&_a]:text-blue-700 [&_a]:underline"
          dangerouslySetInnerHTML={{ __html: notice.bodyHtml }}
        />
      </article>
    </PageShell>
  );
}
