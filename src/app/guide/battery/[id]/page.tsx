import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/common/PageShell";
import {
  getGuidePostById,
  GUIDE_POST_CATEGORY_META,
} from "@/lib/guide/battery-guide-posts";
import { bm } from "@/lib/design-tokens";

type Props = { params: Promise<{ id: string }> };

export default async function BatteryGuidePostPage({ params }: Props) {
  const { id } = await params;
  const post = getGuidePostById(id);
  if (!post) notFound();

  const meta = GUIDE_POST_CATEGORY_META[post.category];
  const paragraphs = post.content.split("\n\n").filter(Boolean);

  return (
    <PageShell
      zone="guide"
      pageLabel="배터리 가이드"
      title={post.title}
      description={post.summary}
    >
      <article className="mx-auto max-w-2xl space-y-4">
        <Link href={meta.hubPath} className={`${bm.btnTertiary} text-xs`}>
          ← {meta.label}
        </Link>
        <section className={`${bm.card} ${bm.cardPad}`}>
          <p className="text-[10px] font-bold text-slate-400">{meta.label}</p>
          <h1 className="mt-1 text-lg font-black text-slate-950">{post.title}</h1>
          <p className="mt-2 text-sm font-medium text-slate-600">{post.summary}</p>
          <div className="mt-4 space-y-3 text-sm font-medium leading-relaxed text-slate-700">
            {paragraphs.map((para) => (
              <p key={para.slice(0, 24)}>{para}</p>
            ))}
          </div>
          {post.tags.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-1">
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
        </section>
      </article>
    </PageShell>
  );
}
