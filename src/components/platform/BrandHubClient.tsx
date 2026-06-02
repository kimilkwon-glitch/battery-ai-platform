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

const PRODUCT_IMAGE_HEIGHT = "h-[9.5rem] sm:h-[10.5rem]";

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
  const dividerBorder = theme.id === "rocket" ? "border-[#242A36]" : "border-slate-200";

  const selectBrand = (id: CustomerBrandHubId) => {
    setActive(id);
    router.replace(`/brands?brand=${id}`, { scroll: false });
  };

  return (
    <motion.div
      className={clsx("brand-hub -mx-1 space-y-5 rounded-2xl px-1 py-3 sm:mx-0 sm:space-y-6", theme.pageBg)}
      layout
      transition={{ duration: 0.75, ease: [0.4, 0, 0.2, 1] }}
      data-brand-hub-active={active}
    >
      <nav className="flex gap-2.5 sm:gap-3" role="tablist" aria-label="브랜드 선택">
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
                "flex min-h-[3.5rem] flex-1 items-center justify-center rounded-xl px-5 text-lg font-black tracking-tight transition sm:min-h-[3.75rem] sm:text-xl",
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
            className={clsx("relative space-y-7 sm:space-y-9", theme.panelBg)}
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

            <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
              <InsightCard theme={theme} card={insights.advantage} variant="advantage" dividerBorder={dividerBorder} />
              <InsightCard theme={theme} card={insights.field} variant="field" dividerBorder={dividerBorder} />
            </div>

            <section>
              <header className="mb-5 sm:mb-6">
                <h2 className={clsx("text-3xl font-black tracking-tight sm:text-4xl", theme.bannerText)}>
                  {theme.label} 전 제품
                </h2>
                <p className={clsx("mt-2 text-lg font-medium", theme.bannerMuted)}>
                  등록된 {products.length}개 규격 · CCA·RC·사이즈를 카드에서 확인
                </p>
              </header>
              <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((spec) => (
                  <BrandProductCard
                    key={spec.code}
                    spec={spec}
                    brandId={active}
                    imageBrandKey={imageBrandKey}
                    theme={theme}
                    dividerBorder={dividerBorder}
                  />
                ))}
              </div>
            </section>

            <p className={clsx("text-center text-base font-medium", theme.bannerMuted)}>
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
        "relative overflow-hidden rounded-2xl p-5 sm:flex sm:items-stretch sm:gap-6 sm:p-6 lg:gap-8 lg:p-8",
        theme.bannerBg,
      )}
    >
      <div
        aria-hidden
        className={clsx(
          "pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full blur-3xl",
          theme.id === "rocket" ? "bg-[#E53935]/25" : "bg-blue-400/20",
        )}
      />
      <div className="relative z-10 flex min-w-0 flex-1 flex-col justify-center">
        <h2
          className={clsx(
            "text-4xl font-black leading-tight tracking-tight sm:text-5xl",
            theme.bannerText,
          )}
        >
          {banner.title}
        </h2>
        <p className={clsx("mt-4 text-xl font-bold leading-snug sm:text-2xl", theme.bannerText)}>
          {banner.headline}
        </p>
        <p className={clsx("mt-4 max-w-xl text-lg font-medium leading-relaxed", theme.bannerMuted)}>
          {banner.description}
        </p>
      </div>
      <div
        className={clsx(
          "relative z-10 mt-5 flex shrink-0 items-center justify-center overflow-hidden rounded-2xl sm:mt-0 sm:w-[min(48%,22rem)] lg:w-[min(46%,24rem)]",
          theme.bannerImageWrap,
        )}
      >
        <div className="flex h-48 w-full items-center justify-center p-1 sm:h-56 lg:h-[15.5rem]">
          <BatteryThumbnail
            code={banner.heroCode}
            imageSet={product.images}
            role="main"
            fit="contain"
            ratio="16/9"
            overlayLabel={false}
            darkOverlay={false}
            className="h-full w-full max-h-full [&_img]:mx-auto [&_img]:max-h-[92%] [&_img]:w-auto [&_img]:object-contain"
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
  dividerBorder,
}: {
  theme: (typeof BRAND_HUB_THEMES)[CustomerBrandHubId];
  card: BrandHubInsightCard;
  variant: "advantage" | "field";
  dividerBorder: string;
}) {
  const Icon = variant === "advantage" ? Sparkles : MessageCircle;

  return (
    <article
      className={clsx(
        "relative flex min-h-[15.5rem] flex-col overflow-hidden rounded-2xl sm:min-h-[16.5rem]",
        theme.insightCard,
      )}
    >
      <div className="flex flex-1 flex-col p-7 sm:p-9">
        <div className="flex items-start gap-4 sm:gap-5">
          <div
            className={clsx(
              "flex size-14 shrink-0 items-center justify-center rounded-xl sm:size-16",
              theme.insightIconWrap,
            )}
          >
            <Icon className="size-7 sm:size-8" strokeWidth={2} aria-hidden />
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <p className={clsx("text-sm font-black uppercase tracking-[0.14em]", theme.accent)}>
              {card.title}
            </p>
            <h3 className={clsx("mt-2 text-2xl font-black leading-snug sm:text-3xl", theme.bannerText)}>
              {card.lead}
            </h3>
            <p className={clsx("mt-3 text-lg font-medium leading-relaxed", theme.bannerMuted)}>
              {card.body}
            </p>
          </div>
        </div>
        <ul
          className={clsx(
            "mt-7 space-y-3.5 border-t pt-7 text-lg font-semibold leading-relaxed",
            dividerBorder,
          )}
        >
          {card.bullets.map((b) => (
            <li key={b} className="flex items-start gap-3 pl-0.5">
              <span className={clsx("mt-[0.65rem] h-0.5 w-5 shrink-0 rounded-full", theme.accentLine)} />
              <span className={theme.bannerText}>{b}</span>
            </li>
          ))}
        </ul>
      </div>
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
  dividerBorder,
}: {
  spec: BatteryBrandSpec;
  brandId: CustomerBrandHubId;
  imageBrandKey: BatteryBrandKey;
  theme: (typeof BRAND_HUB_THEMES)[CustomerBrandHubId];
  dividerBorder: string;
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
        "brand-hub-spec-card group flex h-full flex-col overflow-hidden rounded-xl transition duration-200 motion-safe:hover:-translate-y-0.5",
        theme.productCard,
        theme.productCardHover,
      )}
    >
      <div
        className={clsx(
          "relative flex items-center justify-center overflow-hidden",
          PRODUCT_IMAGE_HEIGHT,
          theme.productImageBg,
        )}
      >
        {hasImage ? (
          <BatteryThumbnail
            code={spec.code}
            imageSet={product.images}
            role="main"
            fit="contain"
            ratio="16/9"
            overlayLabel={false}
            darkOverlay={false}
            className="h-full w-full px-1 [&_img]:mx-auto [&_img]:max-h-[88%] [&_img]:w-auto [&_img]:object-contain"
          />
        ) : (
          <p className={clsx("px-3 text-center text-base font-black", theme.bannerMuted)}>
            {card.displayCode}
          </p>
        )}
        <span
          className={clsx(
            "absolute left-2.5 top-2.5 rounded-md px-2 py-0.5 text-sm font-black",
            badgeClassForFamily(theme, family),
          )}
        >
          {family}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className={clsx("text-xl font-black tracking-tight sm:text-2xl", theme.bannerText)}>
          {card.displayCode}
        </p>
        <dl className={clsx("mt-4 space-y-0", dividerBorder)}>
          <SpecRow label="CCA" value={card.cca} theme={theme} dividerBorder={dividerBorder} />
          <SpecRow label="RC" value={card.rc} theme={theme} dividerBorder={dividerBorder} />
        </dl>
        <div className={clsx("mt-4 border-t pt-4", dividerBorder)}>
          <p className={clsx("text-sm font-bold uppercase tracking-wide", theme.bannerMuted)}>사이즈 (mm)</p>
          <p className={clsx("mt-1.5 text-base font-semibold leading-snug tabular-nums", theme.bannerText)}>
            {card.size}
          </p>
        </div>
        <span className={clsx("mt-auto pt-5 text-base font-black", theme.accent)}>상세보기 →</span>
      </div>
    </Link>
  );
}

function SpecRow({
  label,
  value,
  theme,
  dividerBorder,
}: {
  label: string;
  value: string;
  theme: (typeof BRAND_HUB_THEMES)[CustomerBrandHubId];
  dividerBorder: string;
}) {
  return (
    <div className={clsx("flex items-center justify-between gap-3 border-b py-3 last:border-b-0", dividerBorder)}>
      <dt className={clsx("text-sm font-bold uppercase tracking-wide", theme.bannerMuted)}>{label}</dt>
      <dd className={clsx("text-lg font-bold tabular-nums", theme.bannerText)}>{value}</dd>
    </div>
  );
}
