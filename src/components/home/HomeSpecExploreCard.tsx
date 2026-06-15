import { BatteryCardImage } from "@/components/media/BatteryCardImage";
import { HomeSpecCardDisplayMeta } from "@/components/home/HomeSpecCardDisplayMeta";
import { BatteryProductCardActions } from "@/components/product/BatteryProductCardActions";
import { getHomeCatalogCardDisplay } from "@/lib/home-catalog-card-display";
import type { HomeCatalogBrandId, HomeCatalogProduct } from "@/lib/home-main-catalog-data";
import { HOME_CATALOG_BRAND_KEY } from "@/lib/home-main-catalog-data";

const HOME_BRAND_LABEL: Record<HomeCatalogBrandId, string> = {
  rocket: "로케트",
  solite: "쏠라이트",
};

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
      className="home-spec-card bm-card-unified group flex h-full flex-col bg-white motion-safe:hover:-translate-y-0.5"
      data-home-spec-card={displayName}
      data-home-spec-search-code={searchCode}
      data-home-spec-brand={brand}
    >
      <div className="home-spec-card-image">
        <BatteryCardImage
          key={`${brand}-${imageKey}`}
          code={imageKey}
          flushTop
          layout="stack"
          variant="homeLineup"
          preferBrand={preferBrand}
          className="home-spec-card-image__stage mx-auto h-full w-full"
        />
      </div>

      <div className="home-spec-card-body flex flex-1 flex-col">
        <p className="home-spec-card-brand">{HOME_BRAND_LABEL[brand]}</p>
        <div className="home-spec-card-title-row" role="group" aria-label={`${displayName} 규격`}>
          <div className="home-spec-card-title-group">
            <h3 className="home-spec-code-title">{displayName}</h3>
            <span className="home-spec-card-badge">{typeTag}</span>
          </div>
        </div>

        <HomeSpecCardDisplayMeta
          display={cardDisplay}
          productCode={searchCode}
          productName={displayName}
          brandLabel={HOME_BRAND_LABEL[brand]}
        />

        <BatteryProductCardActions batteryCode={searchCode} brandId={brand} tone="catalog" compact />
      </div>
    </article>
  );
}
