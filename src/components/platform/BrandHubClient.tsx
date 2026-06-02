"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Sparkles } from "lucide-react";
import clsx from "clsx";
import { BatteryThumbnail } from "@/components/BatteryThumbnail";
import { hasRocketBatteryAssets, hasSoliteBatteryAssets } from "@/lib/battery-alias-map";
import type { BatteryBrandKey } from "@/lib/battery-alias-map";
import {
  BRAND_HUB_BANNER,
  BRAND_HUB_FOOTNOTE,
  BRAND_HUB_INSIGHTS,
  BRAND_HUB_LOGOS,
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

const PANEL_INNER =
  "relative px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12";

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
  const dividerBorder = theme.id === "rocket" ? "border-[#2d3544]" : "border-slate-200";
  const labelMuted =
    theme.id === "rocket" ? "text-[#AEB8C6]" : "text-slate-500";

  const selectBrand = (id: CustomerBrandHubId) => {
    setActive(id);
    router.replace(`/brands?brand=${id}`, { scroll: false });
  };

  return (
    <motion.div
      className="brand-hub space-y-4 sm:space-y-5"
      layout
      transition={{ duration: 0.75, ease: [0.4, 0, 0.2, 1] }}
      data-brand-hub-active={active}
    >
      <nav
        className={clsx("flex gap-2.5 sm:gap-3", theme.tabRail)}
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
                "flex min-h-[3.5rem] flex-1 items-center justify-center rounded-xl px-5 text-lg font-black tracking-tight transition duration-200 sm:min-h-[3.75rem] sm:text-xl",
                selected ? t.tabActive : t.tabIdle,
              )}
            >
              {t.label}
            </button>
          );
        })}
      </nav>

      <div className={clsx("relative overflow-hidden rounded-2xl", theme.panelShell)}>
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            role="tabpanel"
            variants={panelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={PANEL_TRANSITION}
            className={clsx(PANEL_INNER, "space-y-9 sm:space-y-11 lg:space-y-12", theme.panelBg)}
          >
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-20"
              initial={{ x: "-120%", opacity: 0.95 }}
              animate={{ x: "120%", opacity: 0 }}
              transition={{ duration: 0.82, ease: [0.4, 0, 0.2, 1] }}
              style={{ background: theme.washGradient }}
            />

            <BrandHeroBanner theme={theme} banner={banner} imageBrandKey={imageBrandKey} brandId={active} />

            <div className="grid gap-5 lg:grid-cols-2 lg:gap-7">
              <InsightCard
                theme={theme}
                card={insights.advantage}
                variant="advantage"
                dividerBorder={dividerBorder}
              />
              <InsightCard
                theme={theme}
                card={insights.field}
                variant="field"
                dividerBorder={dividerBorder}
              />
            </div>

            <section className="pt-1">
              <header className="mb-6 sm:mb-8">
                <h2 className={clsx("text-3xl font-black tracking-tight sm:text-4xl", theme.bannerText)}>
                  {theme.label} 전 제품
                </h2>
                <p className={clsx("mt-3 text-lg font-medium", theme.bannerMuted)}>
                  등록된 {products.length}개 규격 · CCA·RC·사이즈를 카드에서 확인
                </p>
              </header>
              <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((spec) => (
                  <BrandProductCard
                    key={spec.code}
                    spec={spec}
                    brandId={active}
                    imageBrandKey={imageBrandKey}
                    theme={theme}
                    dividerBorder={dividerBorder}
                    labelMuted={labelMuted}
                  />
                ))}
              </div>
            </section>

            <p className={clsx("pt-2 text-center text-base font-medium", theme.bannerMuted)}>
              {BRAND_HUB_FOOTNOTE[active]}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function BrandHubBannerLogo({
  brandId,
  theme,
  fallbackTitle,
}: {
  brandId: CustomerBrandHubId;
  theme: (typeof BRAND_HUB_THEMES)[CustomerBrandHubId];
  fallbackTitle: string;
}) {
  const assets = BRAND_HUB_LOGOS[brandId];
  const [imgError, setImgError] = useState(false);

  if (imgError) {
    return (
      <h2
        className={clsx(
          "text-4xl font-black leading-tight tracking-tight sm:text-5xl",
          theme.bannerText,
        )}
      >
        {fallbackTitle}
      </h2>
    );
  }

  const logo = (
    <Image
      src={assets.src}
      alt={assets.alt}
      width={assets.width}
      height={assets.height}
      className="h-9 w-auto max-w-[min(100%,18rem)] object-contain object-left sm:h-11 md:h-12 lg:h-[3.5rem]"
      priority
      onError={() => setImgError(true)}
    />
  );

  return theme.logoWrap ? <div className={theme.logoWrap}>{logo}</div> : logo;
}

function BrandHeroBanner({
  theme,
  banner,
  imageBrandKey,
  brandId,
}: {
  theme: (typeof BRAND_HUB_THEMES)[CustomerBrandHubId];
  banner: (typeof BRAND_HUB_BANNER)[CustomerBrandHubId];
  imageBrandKey: BatteryBrandKey;
  brandId: CustomerBrandHubId;
}) {
  const product = getBattery(banner.heroCode, imageBrandKey === "solite" ? "solite" : "rocket");

  return (
    <section
      className={clsx(
        "relative overflow-hidden rounded-2xl p-6 sm:flex sm:items-stretch sm:gap-8 sm:p-8 lg:gap-10 lg:p-10",
        theme.bannerBg,
      )}
    >
      <div
        aria-hidden
        className={clsx(
          "pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full blur-3xl",
          theme.id === "rocket" ? "bg-[#E53935]/20" : "bg-blue-400/20",
        )}
      />
      <div className="relative z-10 flex min-w-0 flex-1 flex-col justify-center">
        <BrandHubBannerLogo brandId={brandId} theme={theme} fallbackTitle={banner.title} />
        <p className={clsx("mt-5 text-xl font-bold leading-snug sm:text-2xl", theme.bannerText)}>
          {banner.headline}
        </p>
        <p className={clsx("mt-4 max-w-xl text-lg font-medium leading-relaxed", theme.bannerMuted)}>
          {banner.description}
        </p>
      </div>
      <div
        className={clsx(
          "relative z-10 mt-6 flex shrink-0 items-center justify-center overflow-hidden rounded-2xl sm:mt-0 sm:w-[min(48%,22rem)] lg:w-[min(46%,24rem)]",
          theme.bannerImageWrap,
        )}
      >
        <div className="flex h-48 w-full items-center justify-center p-1.5 sm:h-56 lg:h-[15.5rem]">
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
            <p className={clsx("text-sm font-bold uppercase tracking-[0.14em]", theme.accent)}>
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
            "mt-8 space-y-3.5 border-t pt-8 text-lg font-medium leading-relaxed",
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
  labelMuted,
}: {
  spec: BatteryBrandSpec;
  brandId: CustomerBrandHubId;
  imageBrandKey: BatteryBrandKey;
  theme: (typeof BRAND_HUB_THEMES)[CustomerBrandHubId];
  dividerBorder: string;
  labelMuted: string;
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
        "brand-hub-spec-card group flex h-full flex-col overflow-hidden rounded-xl transition duration-200",
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
            className="h-full w-full px-1.5 [&_img]:mx-auto [&_img]:max-h-[88%] [&_img]:w-auto [&_img]:object-contain"
          />
        ) : (
          <p className={clsx("px-3 text-center text-base font-bold", theme.bannerMuted)}>
            {card.displayCode}
          </p>
        )}
        <span
          className={clsx(
            "absolute left-3 top-3 rounded-md px-2.5 py-1 text-sm",
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
          <SpecRow
            label="CCA"
            value={card.cca}
            theme={theme}
            dividerBorder={dividerBorder}
            labelMuted={labelMuted}
          />
          <SpecRow
            label="RC"
            value={card.rc}
            theme={theme}
            dividerBorder={dividerBorder}
            labelMuted={labelMuted}
          />
        </dl>
        <div className={clsx("mt-4 border-t pt-4", dividerBorder)}>
          <p className={clsx("text-sm font-bold uppercase tracking-wide", labelMuted)}>사이즈 (mm)</p>
          <p className={clsx("mt-1.5 text-base font-semibold leading-snug tabular-nums", theme.bannerText)}>
            {card.size}
          </p>
        </div>
        <span className={clsx("mt-auto pt-5 text-base font-bold", theme.accent)}>상세보기 →</span>
      </div>
    </Link>
  );
}

function SpecRow({
  label,
  value,
  theme,
  dividerBorder,
  labelMuted,
}: {
  label: string;
  value: string;
  theme: (typeof BRAND_HUB_THEMES)[CustomerBrandHubId];
  dividerBorder: string;
  labelMuted: string;
}) {
  return (
    <div className={clsx("flex items-center justify-between gap-3 border-b py-3 last:border-b-0", dividerBorder)}>
      <dt className={clsx("text-sm font-bold uppercase tracking-wide", labelMuted)}>{label}</dt>
      <dd className={clsx("text-lg font-bold tabular-nums", theme.bannerText)}>{value}</dd>
    </div>
  );
}
