import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/common/PageShell";
import { SupportNoticeImage } from "@/components/support/SupportNoticeImage";
import { getSupportNotice } from "@/lib/support-notices-data";
import { sanitizeNoticeHtml } from "@/lib/security/sanitize-notice-html.server";
import { HUB_SUPPORT } from "@/lib/customer-hub-routes";
import { bm } from "@/lib/design-tokens";

export default async function SupportNoticeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const notice = await getSupportNotice(id);
  if (!notice) notFound();

  const safeBodyHtml = sanitizeNoticeHtml(notice.bodyHtml);

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
          className="support-notice-body prose prose-slate mt-6 max-w-none overflow-x-auto break-words text-sm font-medium text-slate-700 [&_a]:break-words [&_a]:text-blue-700 [&_a]:underline [&_img]:h-auto [&_img]:max-w-full [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-slate-200 [&_td]:px-3 [&_td]:py-2 [&_th]:border [&_th]:border-slate-200 [&_th]:bg-slate-50 [&_th]:px-3 [&_th]:py-2"
          dangerouslySetInnerHTML={{ __html: safeBodyHtml }}
        />
      </article>
    </PageShell>
  );
}
