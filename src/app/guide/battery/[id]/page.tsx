import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/common/PageShell";
import { BatteryGuideCard } from "@/components/guide/BatteryGuideCard";
import {
  getGuidePostById,
  GUIDE_POST_CATEGORY_META,
  listPublishedGuidePosts,
} from "@/lib/guide/battery-guide-posts";
import { sanitizeNoticeHtml } from "@/lib/security/sanitize-notice-html.server";
import { bm } from "@/lib/design-tokens";

type Props = { params: Promise<{ id: string }> };

export default async function BatteryGuidePostPage({ params }: Props) {
  const { id } = await params;
  const post = await getGuidePostById(id);
  if (!post) notFound();

  const meta = GUIDE_POST_CATEGORY_META[post.category];
  const safeBodyHtml = sanitizeNoticeHtml(post.content);
  const related = (await listPublishedGuidePosts(post.category))
    .filter((p) => p.id !== post.id)
    .slice(0, 4);

  return (
    <PageShell
      zone="guide"
      pageLabel="배터리 가이드"
      title={post.title}
      description={post.summary}
      showPageHeader={false}
    >
      <article className="battery-guide-detail mx-auto max-w-2xl space-y-4">
        <Link href={meta.hubPath} className={`${bm.btnTertiary} text-xs`}>
          ← {meta.label}
        </Link>

        <section className={`${bm.card} overflow-hidden`}>
          {post.thumbnail ? (
            <div className="battery-guide-detail__hero relative aspect-[16/10] w-full bg-slate-100">
              <Image
                src={post.thumbnail}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 672px"
                priority
                unoptimized
              />
            </div>
          ) : (
            <div
              className={`battery-guide-detail__hero battery-guide-detail__hero--placeholder battery-guide-card__media--${post.category} aspect-[16/10] w-full`}
              aria-hidden
            />
          )}

          <div className={`${bm.cardPad} space-y-3`}>
            <p className="text-[10px] font-bold text-slate-400">{meta.label}</p>
            <h1 className="text-xl font-black leading-snug text-slate-950 sm:text-2xl">{post.title}</h1>
            <p className="text-sm font-medium leading-relaxed text-slate-600">{post.summary}</p>
            <p className="text-[11px] font-semibold text-slate-400">
              업데이트 {post.updatedAt.slice(0, 10)}
            </p>
            <div
              className="battery-guide-detail__body prose prose-slate max-w-none text-sm font-medium leading-relaxed text-slate-700 [&_a]:break-words [&_a]:text-blue-700 [&_a]:underline [&_img]:max-w-full"
              dangerouslySetInnerHTML={{ __html: safeBodyHtml }}
            />
            {post.tags.length > 0 ? (
              <div className="flex flex-wrap gap-1 pt-1">
                {post.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600"
                  >
                    {t}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </section>

        {related.length > 0 ? (
          <section className="space-y-3">
            <h2 className="text-sm font-black text-slate-900">관련 가이드</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {related.map((item) => (
                <BatteryGuideCard key={item.id} post={item} />
              ))}
            </div>
          </section>
        ) : null}
      </article>
    </PageShell>
  );
}
