import Link from "next/link";
import { BatteryCardImage } from "@/components/media/BatteryCardImage";
import type { HomeCatalogBrandId, HomeCatalogProduct } from "@/lib/home-main-catalog-data";
import {
  HOME_CATALOG_BRAND_KEY,
  homeSpecCardCtas,
} from "@/lib/home-main-catalog-data";

type Props = {
  product: HomeCatalogProduct;
  brand: HomeCatalogBrandId;
};

export function HomeSpecExploreCard({ product, brand }: Props) {
  const { displayName, searchCode, imageKey, typeTag, summary } = product;
  const preferBrand = HOME_CATALOG_BRAND_KEY[brand];

  return (
    <article
      className="home-spec-card group flex h-full flex-col overflow-hidden rounded-[20px] border border-slate-200/90 bg-white shadow-[0_4px_24px_rgba(15,23,42,0.05)] transition duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-[0_12px_32px_rgba(15,23,42,0.08)]"
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
          {homeSpecCardCtas(searchCode).map((cta) => (
            <Link
              key={cta.key}
              className="home-spec-cta-pill inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-800 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800"
              href={cta.href}
            >
              {cta.label}
            </Link>
          ))}
        </div>

        <div className="home-spec-card-fit mt-auto border-t border-slate-100 pt-4">
          <Link
            className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-[var(--bm-navy)] px-4 text-sm font-bold text-white transition hover:bg-[var(--bm-primary)]"
            href={homeSpecCardCtas(searchCode)[0].href}
          >
            해당 규격 보기
          </Link>
        </div>
      </div>
    </article>
  );
}
