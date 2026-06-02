"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
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

const revealEase = [0.22, 1, 0.36, 1] as const;

export function BatteryDetailBodyImages({ code, brandId, manufacturer, brand }: Props) {
  const sections = batteryDetailBodySectionsForCode(code, { brandId, manufacturer, brand });

  return (
    <div className="battery-detail-content__sections" aria-label="상품 상세 안내" data-battery-detail-body-content={code}>
      {sections.map((section, index) => (
        <DetailSectionBlock key={section.id} section={section} index={index} productCode={code} />
      ))}
    </div>
  );
}

function DetailSectionBlock({
  section,
  index,
  productCode,
}: {
  section: DetailBodySection;
  index: number;
  productCode: string;
}) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(Boolean(reduceMotion));

  useEffect(() => {
    if (reduceMotion) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduceMotion]);

  const variantClass = variantClassName(section.variant);
  const motionProps = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        animate: visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
        transition: { duration: 0.38, delay: Math.min(index * 0.06, 0.24), ease: revealEase },
      };

  if (reduceMotion) {
    return (
      <section
        ref={ref}
        id={`battery-detail-section-${section.id}`}
        className={`battery-detail-section battery-detail-reveal is-visible ${variantClass}`}
        data-detail-section={section.id}
      >
        <SectionBody section={section} productCode={productCode} reduceMotion />
      </section>
    );
  }

  return (
    <motion.section
      ref={ref}
      id={`battery-detail-section-${section.id}`}
      className={`battery-detail-section battery-detail-reveal ${variantClass} ${visible ? "is-visible" : ""}`}
      data-detail-section={section.id}
      {...motionProps}
    >
      <SectionBody section={section} productCode={productCode} reduceMotion={reduceMotion} />
    </motion.section>
  );
}

function SectionBody({
  section,
  productCode,
  reduceMotion,
}: {
  section: DetailBodySection;
  productCode: string;
  reduceMotion: boolean | null;
}) {
  return (
    <>
      <header className="battery-detail-section__head">
        <h3 className="battery-detail-section__title">{section.title}</h3>
        {section.lead ? <p className="battery-detail-section__lead">{section.lead}</p> : null}
      </header>

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
          {section.images.map((img, imgIndex) => (
            <DetailImageFigure
              key={img.src}
              item={img}
              productCode={productCode}
              delayIndex={imgIndex}
              reduceMotion={reduceMotion}
            />
          ))}
        </div>
      ) : null}
    </>
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
  delayIndex,
  reduceMotion,
}: {
  item: BatteryDetailBodyImage;
  productCode: string;
  delayIndex: number;
  reduceMotion: boolean | null;
}) {
  const inner = (
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

  if (reduceMotion) return inner;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -6% 0px" }}
      transition={{ duration: 0.34, delay: delayIndex * 0.05, ease: revealEase }}
    >
      {inner}
    </motion.div>
  );
}
