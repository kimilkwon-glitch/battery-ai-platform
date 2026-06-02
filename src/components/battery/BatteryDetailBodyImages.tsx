"use client";

import {
  batteryDetailBodySectionsForCode,
  type DetailBodySection,
  type DetailBodySectionVariant,
  type DetailPointCard,
} from "@/lib/battery-detail/battery-detail-body-sections";
import type { BatteryDetailBodyImage } from "@/lib/battery-detail/battery-detail-body-images";

type Props = {
  code: string;
  brandId?: string;
  manufacturer?: string;
  brand?: string;
};

export function BatteryDetailBodyImages({ code, brandId, manufacturer, brand }: Props) {
  const sections = batteryDetailBodySectionsForCode(code, { brandId, manufacturer, brand }).filter(
    (section) => (section.images?.length ?? 0) > 0 || (section.cards?.length ?? 0) > 0,
  );

  if (sections.length === 0) return null;

  return (
    <div className="battery-detail-content__sections" aria-label="상품 상세 안내" data-battery-detail-body-content={code}>
      {sections.map((section) => (
        <DetailSectionBlock key={section.id} section={section} productCode={code} />
      ))}
    </div>
  );
}

function DetailSectionBlock({
  section,
  productCode,
}: {
  section: DetailBodySection;
  productCode: string;
}) {
  const variantClass = variantClassName(section.variant);
  const showHead = Boolean(section.title && (section.lead || section.variant !== "gallery"));

  return (
    <section
      id={`battery-detail-section-${section.id}`}
      className={`battery-detail-section ${variantClass}`}
      data-detail-section={section.id}
    >
      {showHead ? (
        <header className="battery-detail-section__head">
          <h3 className="battery-detail-section__title">{section.title}</h3>
          {section.lead ? <p className="battery-detail-section__lead">{section.lead}</p> : null}
        </header>
      ) : section.title ? (
        <h3 className="battery-detail-section__title battery-detail-section__title--compact">{section.title}</h3>
      ) : null}

      {section.cards?.length ? (
        <div className="battery-detail-section__grid">
          {section.cards.map((card) => (
            <PointCard key={card.title} card={card} />
          ))}
        </div>
      ) : null}

      {section.images?.length ? (
        <div
          className={
            section.variant === "gallery"
              ? "battery-detail-section__gallery"
              : "battery-detail-section__frame"
          }
        >
          {section.images.map((img) => (
            <DetailImageFigure key={img.src} item={img} productCode={productCode} />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function variantClassName(variant: DetailBodySectionVariant): string {
  switch (variant) {
    case "hero":
      return "battery-detail-section--hero";
    case "brand":
      return "battery-detail-section--brand";
    case "cards":
      return "battery-detail-section--cards";
    case "muted":
      return "battery-detail-section--muted battery-detail-section--cards";
    case "gallery":
    default:
      return "battery-detail-section--gallery";
  }
}

function PointCard({ card }: { card: DetailPointCard }) {
  return (
    <article
      className={`battery-detail-point-card ${card.emphasis ? "battery-detail-point-card--emphasis" : ""}`}
    >
      <h4 className="battery-detail-point-card__title">{card.title}</h4>
      <p className="battery-detail-point-card__body">{card.description}</p>
    </article>
  );
}

function DetailImageFigure({
  item,
  productCode,
}: {
  item: BatteryDetailBodyImage;
  productCode: string;
}) {
  return (
    <figure className="battery-detail-section__figure m-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.src}
        alt={item.alt}
        loading="lazy"
        decoding="async"
        data-detail-body-src={item.src}
        data-product-code={productCode}
      />
    </figure>
  );
}
