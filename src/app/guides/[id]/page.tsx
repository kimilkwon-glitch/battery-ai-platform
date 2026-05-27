import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Breadcrumb, PortalHeader } from "@/components/portal";
import { BatteryImageCard } from "@/components/BatteryThumbnail";
import { VehicleCard } from "@/components/portal";
import { ContentCoverImage } from "@/components/content/ContentCoverImage";
import {
  formatArticleDate,
  getAllArticles,
  getArticleById,
  getBatteryHref,
  getVehicleHref,
} from "@/lib/content";
import { resolveContentCoverImage } from "@/lib/content/getContentImage";
import {
  getGuideSectionImagesForArticle,
  resolveBatteryImageSetForCode,
} from "@/lib/batteryImages";
import { getVehicleAsset, vehicleAssetHref } from "@/lib/car-assets";
import { getBattery } from "@/lib/platform-data";
import { GuideActivityTracker } from "@/components/guides/GuideActivityTracker";
import { GuideNavFooter } from "@/components/guides/GuideNavFooter";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return getAllArticles().map((a) => ({ id: a.id }));
}

export default async function GuideDetailPage({ params }: Props) {
  const { id } = await params;
  const article = getArticleById(id);
  if (!article || article.status !== "published") notFound();

  const primaryBattery = article.batteryIds[0];
  const contentCover = resolveContentCoverImage(article.id);
  const sectionImages = getGuideSectionImagesForArticle(article);
  const bat = primaryBattery ? getBattery(primaryBattery) : null;

  return (
    <main className="min-h-screen bg-[var(--bm-page-bg)] text-slate-950">
      <GuideActivityTracker articleId={article.id} batteryIds={article.batteryIds} vehicleIds={article.vehicleIds} />
      <PortalHeader title="가이드" showSearch />
      <section className="mx-auto max-w-[960px] space-y-4 px-4 py-4">
        <Breadcrumb
          items={[
            { label: "홈", href: "/" },
            { label: "가이드", href: "/guides" },
            { label: article.title },
          ]}
        />

        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <p className="text-[10px] font-black text-[#2563EB]">{article.category}</p>
          <h1 className="mt-1 text-2xl font-black tracking-[-0.04em]">{article.title}</h1>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-600">{article.description}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {article.tags.map((tag) => (
              <Link
                className="rounded-md bg-slate-50 px-2 py-1 text-[10px] font-black text-slate-600 ring-1 ring-slate-200 hover:bg-blue-50"
                href={`/search?q=${encodeURIComponent(tag)}`}
                key={tag}
              >
                #{tag}
              </Link>
            ))}
          </div>
          <p className="mt-2 text-[10px] font-semibold text-slate-400">
            발행 {formatArticleDate(article.createdAt)} · 수정 {formatArticleDate(article.updatedAt)}
          </p>

          <div className="relative mt-4 overflow-hidden rounded-xl ring-1 ring-slate-200">
            {contentCover.showHero && (contentCover.imagePath || contentCover.imageNeeded) ? (
              <ContentCoverImage
                contentId={article.id}
                objectFit="contain"
                roundedClass="rounded-xl"
                title={article.title}
                variant="hero"
              />
            ) : bat?.images?.main ? (
              <div className="flex min-h-[180px] w-full max-w-sm items-center justify-center bg-gradient-to-br from-slate-100 via-white to-blue-50 p-4">
                <BatteryImageCard
                  capacity={bat.capacity}
                  cca={bat.cca}
                  code={primaryBattery!}
                  fit="contain"
                  imageSet={bat.images}
                  ratio="16/9"
                  role="main"
                  terminal={bat.terminal}
                  type={bat.type}
                />
              </div>
            ) : (
              <div className="flex min-h-[180px] items-center justify-center bg-gradient-to-br from-slate-100 via-white to-blue-50 p-6 text-center">
                <p className="text-xs font-black text-slate-500">이미지 준비 중</p>
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {article.vehicleIds.map((vid) => {
              const asset = getVehicleAsset(vid);
              const href = asset ? vehicleAssetHref(asset) : getVehicleHref(vid);
              return (
                <Link
                  className="rounded-lg bg-blue-50 px-3 py-1.5 text-[11px] font-black text-blue-700 ring-1 ring-blue-100 hover:bg-blue-100"
                  href={href}
                  key={vid}
                >
                  {asset?.displayName ?? vid}
                </Link>
              );
            })}
            {article.batteryIds.map((bid) => (
              <Link
                className="rounded-lg bg-slate-950 px-3 py-1.5 text-[11px] font-black text-white hover:bg-blue-600"
                href={getBatteryHref(bid)}
                key={bid}
              >
                {bid}
              </Link>
            ))}
          </div>

          <div className="prose prose-slate mt-6 max-w-none space-y-6">
            {article.sections.map((section, index) => {
              const sectionImg = sectionImages[index];
              return (
                <section key={section.heading}>
                  <h2 className="text-base font-black text-slate-950">{section.heading}</h2>
                  {sectionImg ? (
                    <div className="relative mt-3 flex min-h-[140px] items-center justify-center overflow-hidden rounded-xl bg-slate-50 ring-1 ring-slate-200">
                      <Image
                        alt={`${section.heading} 참고 이미지`}
                        className="max-h-[160px] w-auto max-w-full object-contain p-4"
                        height={160}
                        src={sectionImg}
                        width={320}
                      />
                    </div>
                  ) : null}
                  <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-700">{section.body}</p>
                </section>
              );
            })}
          </div>

          <div className="mt-8 rounded-xl bg-blue-50 p-4 ring-1 ring-blue-100">
            <Link
              className="inline-flex rounded-lg bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-700"
              href={article.cta.href}
            >
              {article.cta.label}
            </Link>
          </div>
        </article>

        {article.vehicleIds.length > 0 ? (
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-black">관련 차량</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {article.vehicleIds.map((vid) => {
                const asset = getVehicleAsset(vid);
                if (!asset) {
                  return (
                    <Link
                      className="rounded-xl bg-slate-50 p-3 text-xs font-black ring-1 ring-slate-200 hover:bg-blue-50"
                      href={getVehicleHref(vid)}
                      key={vid}
                    >
                      {vid.replace(/-/g, " ")} 배터리 확인 →
                    </Link>
                  );
                }
                return (
                  <VehicleCard
                    href={vehicleAssetHref(asset)}
                    key={vid}
                    title={asset.displayName}
                    vehicleId={asset.catalogId ?? asset.id}
                  />
                );
              })}
            </div>
          </section>
        ) : null}

        {article.batteryIds.length > 0 ? (
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-black">관련 배터리</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {article.batteryIds.map((bid) => {
                const b = getBattery(bid);
                const imageSet = resolveBatteryImageSetForCode(bid);
                return (
                  <BatteryImageCard
                    capacity={b.capacity}
                    cca={b.cca}
                    code={bid}
                    fit="contain"
                    href={getBatteryHref(bid)}
                    imageSet={imageSet.main ? imageSet : b.images}
                    key={bid}
                    ratio="16/9"
                    role="main"
                    terminal={b.terminal}
                    type={b.type}
                  />
                );
              })}
            </div>
          </section>
        ) : null}

        <GuideNavFooter articleId={article.id} />

        <div className="text-center">
          <Link className="text-xs font-black text-blue-600 hover:underline" href="/guides">
            ← 가이드 목록으로
          </Link>
        </div>
      </section>
    </main>
  );
}
