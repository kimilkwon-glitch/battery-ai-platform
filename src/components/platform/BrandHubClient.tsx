"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { BatteryThumbnail, batteryImageFit } from "@/components/BatteryThumbnail";
import type { BatteryBrandKey } from "@/lib/battery-alias-map";
import {
  BRAND_HUB_BANNER,
  BRAND_HUB_FEATURED_CODES,
  BRAND_HUB_FOOTNOTE,
  BRAND_HUB_INSIGHTS,
  BRAND_HUB_THEMES,
  CUSTOMER_BRAND_HUB_IDS,
  isCustomerBrandHubId,
  resolveBrandHubSpecCard,
  type CustomerBrandHubId,
} from "@/lib/brand-hub-customer";
import { getBattery } from "@/lib/platform-data";

const PANEL_TRANSITION = { duration: 0.78, ease: [0.65, 0, 0.35, 1] as const };

const panelVariants = {
  initial: {
    opacity: 0.5,
    clipPath: "inset(0 0 100% 0)",
    filter: "blur(6px)",
  },
  animate: {
    opacity: 1,
    clipPath: "inset(0 0 0% 0)",
    filter: "blur(0px)",
  },
  exit: {
    opacity: 0.35,
    clipPath: "inset(100% 0 0 0)",
    filter: "blur(8px)",
  },
};

export function BrandHubClient() {
  const params = useSearchParams();
  const router = useRouter();
  const [active, setActive] = useState<CustomerBrandHubId>("rocket");

  useEffect(() => {
    const b = params.get("brand");
    if (b && isCustomerBrandHubId(b)) setActive(b);
    else if (b && !isCustomerBrandHubId(b)) {
      router.replace("/brands?brand=rocket", { scroll: false });
    }
  }, [params, router]);

  const theme = BRAND_HUB_THEMES[active];
  const banner = BRAND_HUB_BANNER[active];
  const insights = BRAND_HUB_INSIGHTS[active];
  const codes = BRAND_HUB_FEATURED_CODES[active];
  const imageBrandKey: BatteryBrandKey = active === "solite" ? "solite" : "rocket";

  const selectBrand = (id: CustomerBrandHubId) => {
    setActive(id);
    router.replace(`/brands?brand=${id}`, { scroll: false });
  };

  return (
    <motion.div
      className={clsx("brand-hub -mx-1 space-y-6 rounded-2xl px-1 py-2 sm:mx-0", theme.pageBg)}
      layout
      transition={{ duration: 0.75, ease: [0.4, 0, 0.2, 1] }}
      data-brand-hub-active={active}
    >
      {/* 탭 — 로케트 / 쏠라이트 */}
      <nav
        className="flex gap-2 sm:gap-3"
        role="tablist"
        aria-label="브랜드 선택"
      >
        {CUSTOMER_BRAND_HUB_IDS.map((id) => {
          const t = BRAND_HUB_THEMES[id];
          const selected = active === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => selectBrand(id)}
              className={clsx(
                "min-h-[48px] flex-1 rounded-xl px-4 text-sm font-black transition sm:text-base",
                selected ? t.tabActive : t.tabIdle,
              )}
            >
              {t.label}
            </button>
          );
        })}
      </nav>

      <div className="relative overflow-hidden rounded-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            role="tabpanel"
            variants={panelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={PANEL_TRANSITION}
            className={clsx("relative space-y-5 sm:space-y-6", theme.panelBg)}
          >
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-20"
              initial={{ x: "-120%", opacity: 0.9 }}
              animate={{ x: "120%", opacity: 0 }}
              transition={{ duration: 0.85, ease: [0.4, 0, 0.2, 1] }}
              style={{ background: theme.washGradient }}
            />

            <BrandHeroBanner
              theme={theme}
              banner={banner}
              imageBrandKey={imageBrandKey}
            />

            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
              <InsightCard theme={theme} card={insights.advantage} />
              <InsightCard theme={theme} card={insights.field} />
            </div>

            <section>
              <h2 className={clsx("text-lg font-black sm:text-xl", theme.bannerText)}>
                {theme.label} 대표 규격
              </h2>
              <p className={clsx("mt-1 text-sm font-medium", theme.bannerMuted)}>
                자주 확인되는 규격만 카드로 정리했습니다.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {codes.map((code) => (
                  <BrandSpecCard
                    key={code}
                    code={code}
                    brandId={active}
                    imageBrandKey={imageBrandKey}
                    theme={theme}
                  />
                ))}
              </div>
            </section>

            <p className={clsx("text-center text-xs font-semibold sm:text-sm", theme.bannerMuted)}>
              {BRAND_HUB_FOOTNOTE[active]}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function BrandHeroBanner({
  theme,
  banner,
  imageBrandKey,
}: {
  theme: (typeof BRAND_HUB_THEMES)[CustomerBrandHubId];
  banner: (typeof BRAND_HUB_BANNER)[CustomerBrandHubId];
  imageBrandKey: BatteryBrandKey;
}) {
  const product = getBattery(banner.heroCode, imageBrandKey === "solite" ? "solite" : "rocket");

  return (
    <section
      className={clsx(
        "relative overflow-hidden rounded-2xl p-4 sm:flex sm:items-center sm:gap-6 sm:p-6",
        theme.bannerBg,
      )}
    >
      <div className="relative z-10 min-w-0 flex-1">
        <p className={clsx("text-xs font-black uppercase tracking-wide", theme.accent)}>
          {theme.label}
        </p>
        <h2 className={clsx("mt-1 text-xl font-black sm:text-2xl", theme.bannerText)}>
          {banner.title}
        </h2>
        <p className={clsx("mt-2 text-sm font-bold sm:text-base", theme.bannerText)}>
          {banner.headline}
        </p>
        <p className={clsx("mt-2 max-w-xl text-sm font-medium leading-relaxed", theme.bannerMuted)}>
          {banner.description}
        </p>
      </div>
      <div
        className={clsx(
          "relative z-10 mt-4 shrink-0 overflow-hidden rounded-xl p-2 sm:mt-0 sm:w-[42%] sm:max-w-[280px]",
          theme.id === "rocket" ? "bg-white/95 ring-1 ring-white/20" : "bg-white ring-1 ring-blue-100",
        )}
      >
        <div className="h-36 sm:h-40">
          <BatteryThumbnail
            code={banner.heroCode}
            imageSet={product.images}
            role="main"
            fit={batteryImageFit(banner.heroCode, imageBrandKey)}
            ratio="16/9"
            overlayLabel={false}
            darkOverlay={false}
            className="h-full"
          />
        </div>
      </div>
    </section>
  );
}

function InsightCard({
  theme,
  card,
}: {
  theme: (typeof BRAND_HUB_THEMES)[CustomerBrandHubId];
  card: { title: string; lead: string; bullets: string[] };
}) {
  return (
    <article className={clsx("rounded-2xl p-4 ring-1 sm:p-5", theme.cardBg, theme.cardRing)}>
      <h3 className={clsx("text-sm font-black", theme.bannerText)}>{card.title}</h3>
      <p className={clsx("mt-2 text-sm font-bold leading-snug", theme.bannerText)}>{card.lead}</p>
      <ul className={clsx("mt-3 space-y-1.5 text-sm font-semibold", theme.bannerMuted)}>
        {card.bullets.map((b) => (
          <li key={b} className="flex gap-2">
            <span
              className={clsx(
                "mt-1.5 size-1.5 shrink-0 rounded-full",
                theme.id === "rocket" ? "bg-red-500" : "bg-blue-500",
              )}
            />
            {b}
          </li>
        ))}
      </ul>
    </article>
  );
}

function BrandSpecCard({
  code,
  brandId,
  imageBrandKey,
  theme,
}: {
  code: string;
  brandId: CustomerBrandHubId;
  imageBrandKey: BatteryBrandKey;
  theme: (typeof BRAND_HUB_THEMES)[CustomerBrandHubId];
}) {
  const spec = resolveBrandHubSpecCard(code, brandId);
  const product = getBattery(code, imageBrandKey === "solite" ? "solite" : "rocket");

  return (
    <Link
      href={spec.detailHref}
      className={clsx(
        "brand-hub-spec-card group flex flex-col overflow-hidden rounded-xl ring-1 transition duration-200",
        theme.cardBg,
        theme.cardRing,
        theme.specCardHover,
      )}
    >
      <div
        className={clsx(
          "relative h-28 sm:h-32",
          theme.id === "rocket" ? "bg-slate-800/50" : "bg-sky-50/80",
        )}
      >
        <BatteryThumbnail
          code={code}
          imageSet={product.images}
          role="main"
          fit={batteryImageFit(code, imageBrandKey)}
          ratio="16/9"
          overlayLabel={false}
          darkOverlay={false}
          className="h-full"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
        <p className={clsx("text-base font-black tracking-tight", theme.bannerText)}>
          {spec.displayCode}
        </p>
        <dl className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs font-semibold">
          <div>
            <dt className={theme.bannerMuted}>CCA</dt>
            <dd className={theme.bannerText}>{spec.cca}</dd>
          </div>
          <div>
            <dt className={theme.bannerMuted}>RC</dt>
            <dd className={theme.bannerText}>{spec.rc}</dd>
          </div>
          <div className="col-span-2">
            <dt className={theme.bannerMuted}>사이즈</dt>
            <dd className={clsx("text-[11px] leading-snug", theme.bannerText)}>{spec.size}</dd>
          </div>
        </dl>
        <span className={clsx("mt-auto pt-1 text-xs font-black", theme.accent)}>
          상세보기 →
        </span>
      </div>
    </Link>
  );
}
