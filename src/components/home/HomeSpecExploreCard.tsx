import Link from "next/link";
import { BatteryCardImage } from "@/components/media/BatteryCardImage";
import type { HomeCatalogBrandId, HomeCatalogProduct } from "@/lib/home-main-catalog-data";
import {
  HOME_CATALOG_BRAND_KEY,
  homeSpecCardDetailHref,
  homeSpecCardSecondaryCtas,
} from "@/lib/home-main-catalog-data";
import { bm } from "@/lib/design-tokens";

type Props = {
  product: HomeCatalogProduct;
  brand: HomeCatalogBrandId;
};

export function HomeSpecExploreCard({ product, brand }: Props) {
  const { displayName, searchCode, imageKey, typeTag, summary } = product;
  const preferBrand = HOME_CATALOG_BRAND_KEY[brand];
  const secondaryCtas = homeSpecCardSecondaryCtas(searchCode);
  const detailHref = homeSpecCardDetailHref(searchCode);
  const reviewsHref = `/batteries/${encodeURIComponent(searchCode)}#battery-reviews`;

  return (
    <article
      className="home-spec-card bm-card-unified group flex h-full flex-col overflow-hidden bg-white motion-safe:hover:-translate-y-0.5"
      data-home-spec-card={displayName}
      data-home-spec-search-code={searchCode}
      data-home-spec-brand={brand}
    >
      <div className="home-spec-card-image border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white p-3">
        <BatteryCardImage
          key={`${brand}-${imageKey}`}
          code={imageKey}
          displayLabel={displayName}
          flushTop
          layout="stack"
          variant="card"
          preferBrand={preferBrand}
          className="mx-auto h-full w-full"
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col p-4 sm:p-5">
        <div className="home-spec-card-head flex min-h-[2.75rem] flex-wrap items-start gap-2">
          <p className="home-spec-code-title text-xl text-slate-950 sm:text-2xl">{displayName}</p>
          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-800 ring-1 ring-blue-100">
            {typeTag}
          </span>
        </div>
        <p className="home-spec-card-summary mt-2.5 text-sm font-medium leading-relaxed text-slate-600">
          {summary}
        </p>

        <div className="home-spec-card-actions mt-5 grid grid-cols-2 gap-2">
          {secondaryCtas.map((cta) => (
            <Link
              key={cta.key}
              className={
                cta.key === "order"
                  ? `${bm.btnPrimary} min-h-[44px] justify-center text-sm`
                  : "home-spec-cta-pill inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-800 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800"
              }
              href={cta.href}
            >
              {cta.label}
            </Link>
          ))}
          <Link
            className={`${bm.btnTertiary} col-span-2 min-h-[40px] justify-center text-xs`}
            href={reviewsHref}
          >
            리뷰 보기
          </Link>
        </div>

        <div className="home-spec-card-fit mt-3 border-t border-slate-100 pt-3">
          <Link
            className={`${bm.btnSecondary} inline-flex min-h-[40px] w-full items-center justify-center text-sm`}
            href={detailHref}
          >
            규격 상세 보기
          </Link>
        </div>
      </div>
    </article>
  );
}
