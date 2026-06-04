import { BatteryCardImage } from "@/components/media/BatteryCardImage";
import { BatteryProductCardActions } from "@/components/product/BatteryProductCardActions";
import type { HomeCatalogBrandId, HomeCatalogProduct } from "@/lib/home-main-catalog-data";
import { HOME_CATALOG_BRAND_KEY } from "@/lib/home-main-catalog-data";

type Props = {
  product: HomeCatalogProduct;
  brand: HomeCatalogBrandId;
};

export function HomeSpecExploreCard({ product, brand }: Props) {
  const { displayName, searchCode, imageKey, typeTag } = product;
  const preferBrand = HOME_CATALOG_BRAND_KEY[brand];

  return (
    <article
      className="home-spec-card bm-card-unified group flex h-full flex-col overflow-hidden bg-white motion-safe:hover:-translate-y-0.5"
      data-home-spec-card={displayName}
      data-home-spec-search-code={searchCode}
      data-home-spec-brand={brand}
    >
      <div className="home-spec-card-image border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white p-2.5 sm:p-3">
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

      <div className="home-spec-card-body flex min-h-0 flex-1 flex-col p-3 sm:p-3.5">
        <div className="home-spec-card-head flex flex-wrap items-center gap-2">
          <p className="home-spec-code-title text-lg text-slate-950 sm:text-xl">{displayName}</p>
          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-800 ring-1 ring-blue-100">
            {typeTag}
          </span>
        </div>

        <BatteryProductCardActions batteryCode={searchCode} brandId={brand} />
      </div>
    </article>
  );
}
