import { BatteryCardImage } from "@/components/media/BatteryCardImage";
import { HomeSpecCardDisplayMeta } from "@/components/home/HomeSpecCardDisplayMeta";
import { BatteryProductCardActions } from "@/components/product/BatteryProductCardActions";
import { getHomeCatalogCardDisplay } from "@/lib/home-catalog-card-display";
import type { HomeCatalogBrandId, HomeCatalogProduct } from "@/lib/home-main-catalog-data";
import { HOME_CATALOG_BRAND_KEY } from "@/lib/home-main-catalog-data";

type Props = {
  product: HomeCatalogProduct;
  brand: HomeCatalogBrandId;
};

export function HomeSpecExploreCard({ product, brand }: Props) {
  const { displayName, searchCode, imageKey, typeTag } = product;
  const preferBrand = HOME_CATALOG_BRAND_KEY[brand];
  const cardDisplay = getHomeCatalogCardDisplay(product);

  return (
    <article
      className="home-spec-card bm-card-unified group flex h-full flex-col overflow-hidden bg-white motion-safe:hover:-translate-y-0.5"
      data-home-spec-card={displayName}
      data-home-spec-search-code={searchCode}
      data-home-spec-brand={brand}
    >
      <div className="home-spec-card-image p-2.5 sm:p-3">
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

      <div className="home-spec-card-body flex min-h-0 flex-1 flex-col p-2.5 sm:p-3">
        <div className="home-spec-card-head">
          <p className="home-spec-code-title">{displayName}</p>
          <span className="home-spec-card-badge">{typeTag}</span>
        </div>

        <HomeSpecCardDisplayMeta display={cardDisplay} />

        <BatteryProductCardActions batteryCode={searchCode} brandId={brand} tone="catalog" compact />
      </div>
    </article>
  );
}
