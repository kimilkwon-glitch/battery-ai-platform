"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Sparkles } from "lucide-react";
import clsx from "clsx";
import { BatteryThumbnail, batteryImageFit } from "@/components/BatteryThumbnail";
import { hasRocketBatteryAssets, hasSoliteBatteryAssets } from "@/lib/battery-alias-map";
import type { BatteryBrandKey } from "@/lib/battery-alias-map";
import {
  BRAND_HUB_BANNER,
  BRAND_HUB_FOOTNOTE,
  BRAND_HUB_INSIGHTS,
  BRAND_HUB_THEMES,
  CUSTOMER_BRAND_HUB_IDS,
  familyLabelForSpec,
  isCustomerBrandHubId,
  listBrandHubProducts,
  resolveBrandHubSpecCard,
  type BrandHubInsightCard,
  type CustomerBrandHubId,
} from "@/lib/brand-hub-customer";
import type { BatteryBrandSpec } from "@/data/battery/types";
import { getBattery } from "@/lib/platform-data";

const PANEL_TRANSITION = { duration: 0.78, ease: [0.65, 0, 0.35, 1] as const };

const panelVariants = {
  initial: {
    opacity: 0.55,
    clipPath: "inset(0 0 100% 0)",
    filter: "blur(8px)",
  },
  animate: {
    opacity: 1,
    clipPath: "inset(0 0 0% 0)",
    filter: "blur(0px)",
  },
  exit: {
    opacity: 0.3,
    clipPath: "inset(100% 0 0 0)",
    filter: "blur(10px)",
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
  const products = useMemo(() => listBrandHubProducts(active), [active]);
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
      <nav className="flex gap-2 sm:gap-3" role="tablist" aria-label="브랜드 선택">
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
                "min-h-[52px] flex-1 rounded-xl px-4 text-sm font-black transition sm:text-base",
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
            className={clsx("relative space-y-6 sm:space-y-8", theme.panelBg)}
          >
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-20"
              initial={{ x: "-120%", opacity: 0.95 }}
              animate={{ x: "120%", opacity: 0 }}
              transition={{ duration: 0.82, ease: [0.4, 0, 0.2, 1] }}
              style={{ background: theme.washGradient }}
            />

            <BrandHeroBanner theme={theme} banner={banner} imageBrandKey={imageBrandKey} />

            <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
              <InsightCard theme={theme} card={insights.advantage} variant="advantage" />
              <InsightCard theme={theme} card={insights.field} variant="field" />
            </div>

            <section>
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h2 className={clsx("text-xl font-black sm:text-2xl", theme.bannerText)}>
                    {theme.label} 전 제품
                  </h2>
                  <p className={clsx("mt-1 text-sm font-semibold sm:text-base", theme.bannerMuted)}>
                    등록된 {products.length}개 규격 · CCA·RC·사이즈를 카드에서 확인
                  </p>
                </div>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((spec) => (
                  <BrandProductCard
                    key={spec.code}
                    spec={spec}
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
        "relative overflow-hidden rounded-2xl p-5 sm:flex sm:items-center sm:gap-8 sm:p-7",
        theme.bannerBg,
      )}
    >
      <div
        aria-hidden
        className={clsx(
          "pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full opacity-40 blur-3xl",
          theme.id === "rocket" ? "bg-red-600" : "bg-blue-400",
        )}
      />
      <div className="relative z-10 min-w-0 flex-1">
        <p className={clsx("text-xs font-black uppercase tracking-widest", theme.accent)}>
          {theme.label}
        </p>
        <h2 className={clsx("mt-2 text-2xl font-black sm:text-3xl", theme.bannerText)}>
          {banner.title}
        </h2>
        <p className={clsx("mt-2 text-base font-bold sm:text-lg", theme.bannerText)}>
          {banner.headline}
        </p>
        <p className={clsx("mt-3 max-w-xl text-sm font-medium leading-relaxed sm:text-base", theme.bannerMuted)}>
          {banner.description}
        </p>
      </div>
      <div
        className={clsx(
          "relative z-10 mt-5 shrink-0 overflow-hidden rounded-2xl p-2.5 sm:mt-0 sm:w-[44%] sm:max-w-[300px]",
          theme.bannerImageWrap,
        )}
      >
        <div className="h-40 sm:h-44">
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
  variant,
}: {
  theme: (typeof BRAND_HUB_THEMES)[CustomerBrandHubId];
  card: BrandHubInsightCard;
  variant: "advantage" | "field";
}) {
  const Icon = variant === "advantage" ? Sparkles : MessageCircle;

  return (
    <article
      className={clsx(
        "relative min-h-[220px] overflow-hidden rounded-2xl p-6 sm:min-h-[240px] sm:p-7",
        theme.insightCard,
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={clsx(
            "flex size-12 shrink-0 items-center justify-center rounded-xl sm:size-14",
            theme.insightIconWrap,
          )}
        >
          <Icon className="size-6 sm:size-7" strokeWidth={2.25} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className={clsx("text-xs font-black uppercase tracking-wide", theme.accent)}>
            {card.title}
          </p>
          <h3 className={clsx("mt-2 text-lg font-black leading-snug sm:text-xl", theme.bannerText)}>
            {card.lead}
          </h3>
          <p className={clsx("mt-2 text-sm font-medium leading-relaxed sm:text-[15px]", theme.bannerMuted)}>
            {card.body}
          </p>
        </div>
      </div>
      <ul className={clsx("mt-5 space-y-2.5 border-t pt-5 text-sm font-semibold sm:text-[15px]", theme.bannerMuted, theme.id === "rocket" ? "border-zinc-800" : "border-slate-100")}>
        {card.bullets.map((b) => (
          <li key={b} className="flex items-start gap-3">
            <span className={clsx("mt-2 h-0.5 w-5 shrink-0 rounded-full", theme.accentLine)} />
            <span className={theme.bannerText}>{b}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function badgeClassForFamily(
  theme: (typeof BRAND_HUB_THEMES)[CustomerBrandHubId],
  family: string,
): string {
  if (family === "AGM") return theme.badgeAgm;
  if (family === "DIN") return theme.badgeDin;
  if (family === "일반형") return theme.badgeCmf;
  return theme.badgeDefault;
}

function BrandProductCard({
  spec,
  brandId,
  imageBrandKey,
  theme,
}: {
  spec: BatteryBrandSpec;
  brandId: CustomerBrandHubId;
  imageBrandKey: BatteryBrandKey;
  theme: (typeof BRAND_HUB_THEMES)[CustomerBrandHubId];
}) {
  const card = resolveBrandHubSpecCard(spec.code, brandId, spec);
  const family = familyLabelForSpec(spec);
  const hasImage =
    imageBrandKey === "solite"
      ? hasSoliteBatteryAssets(spec.code)
      : hasRocketBatteryAssets(spec.code);
  const product = getBattery(spec.code, imageBrandKey === "solite" ? "solite" : "rocket");

  return (
    <Link
      href={card.detailHref}
      className={clsx(
        "brand-hub-spec-card group flex flex-col overflow-hidden rounded-xl transition duration-200 motion-safe:hover:-translate-y-0.5",
        theme.productCard,
        theme.productCardHover,
      )}
    >
      <div className={clsx("relative h-32 sm:h-36", theme.productImageBg)}>
        {hasImage ? (
          <BatteryThumbnail
            code={spec.code}
            imageSet={product.images}
            role="main"
            fit={batteryImageFit(spec.code, imageBrandKey)}
            ratio="16/9"
            overlayLabel={false}
            darkOverlay={false}
            className="h-full"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-3">
            <p className={clsx("text-center text-sm font-black", theme.bannerMuted)}>
              {card.displayCode}
            </p>
          </div>
        )}
        <span
          className={clsx(
            "absolute left-2 top-2 rounded-md px-2 py-0.5 text-[10px] font-black ring-1",
            badgeClassForFamily(theme, family),
          )}
        >
          {family}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className={clsx("text-base font-black tracking-tight sm:text-lg", theme.bannerText)}>
          {card.displayCode}
        </p>
        <dl className="space-y-2 text-sm font-semibold">
          <div
            className={clsx(
              "flex justify-between gap-2 border-b border-dashed pb-2",
              theme.id === "rocket" ? "border-zinc-700" : "border-slate-200",
            )}
          >
            <dt className={theme.bannerMuted}>CCA</dt>
            <dd className={theme.bannerText}>{card.cca}</dd>
          </div>
          <div
            className={clsx(
              "flex justify-between gap-2 border-b border-dashed pb-2",
              theme.id === "rocket" ? "border-zinc-700" : "border-slate-200",
            )}
          >
            <dt className={theme.bannerMuted}>RC</dt>
            <dd className={theme.bannerText}>{card.rc}</dd>
          </div>
          <div>
            <dt className={clsx("text-xs font-bold", theme.bannerMuted)}>사이즈 (mm)</dt>
            <dd className={clsx("mt-0.5 text-[13px] leading-snug", theme.bannerText)}>{card.size}</dd>
          </div>
        </dl>
        <span className={clsx("mt-auto pt-1 text-sm font-black", theme.accent)}>상세보기 →</span>
      </div>
    </Link>
  );
}
