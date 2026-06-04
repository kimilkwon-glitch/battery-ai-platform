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
  BRAND_HUB_FAMILY_TABS,
  BRAND_HUB_CCA_RC_GUIDE,
  BRAND_HUB_INSIGHTS,
  BRAND_HUB_LOGOS,
  BRAND_HUB_THEMES,
  brandHubBannerLogoSrc,
  CUSTOMER_BRAND_HUB_IDS,
  countBrandHubProductsByTab,
  familyLabelForSpec,
  isCustomerBrandHubId,
  listBrandHubProductsForTab,
  resolveBrandHubSpecCard,
  type BrandHubFamilyTabId,
  type BrandHubInsightCard,
  type CustomerBrandHubId,
} from "@/lib/brand-hub-customer";
import { getBrandHubLogoPresentation } from "@/lib/brand-hub-logo-presentation";
import { BRAND_HUB_REFERENCE_BRANDS } from "@/lib/brand-hub-reference-brands";
import type { BatteryBrandSpec } from "@/data/battery/types";
import { getBattery } from "@/lib/platform-data";
import { bm } from "@/lib/design-tokens";

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
  const [familyTab, setFamilyTab] = useState<BrandHubFamilyTabId>("general");

  useEffect(() => {
    const b = params.get("brand");
    if (b && isCustomerBrandHubId(b)) setActive(b);
    else if (b && !isCustomerBrandHubId(b)) {
      router.replace("/brands?brand=rocket", { scroll: false });
    }
  }, [params, router]);

  useEffect(() => {
    setFamilyTab("general");
  }, [active]);

  const theme = BRAND_HUB_THEMES[active];
  const banner = BRAND_HUB_BANNER[active];
  const insights = BRAND_HUB_INSIGHTS[active];
  const tabCounts = useMemo(() => countBrandHubProductsByTab(active), [active]);
  const products = useMemo(
    () => listBrandHubProductsForTab(active, familyTab),
    [active, familyTab],
  );
  const imageBrandKey: BatteryBrandKey = active === "solite" ? "solite" : "rocket";
  const dividerBorder = theme.id === "rocket" ? "border-[#2d3544]" : "border-slate-200";
  const labelMuted = theme.contentMuted;

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
              <header className="mb-5 sm:mb-6">
                <h2 className={clsx("text-3xl font-black tracking-tight sm:text-4xl", theme.contentTitle)}>
                  {theme.label} 전 제품
                </h2>
                <p className={clsx("mt-3 text-lg font-medium", theme.contentMuted)}>
                  제원 DB 기준 · 일반형 / DIN / AGM 분류별 전체 규격
                </p>
              </header>

              <nav
                className={clsx(
                  "mb-6 flex flex-wrap gap-2 rounded-xl p-2 sm:gap-2.5",
                  theme.id === "rocket"
                    ? "bg-[#111318]/80 ring-1 ring-[#2d3544]"
                    : "bg-slate-100/90 ring-1 ring-slate-200",
                )}
                role="tablist"
                aria-label="제품 분류"
              >
                {BRAND_HUB_FAMILY_TABS.map((tab) => {
                  const selected = familyTab === tab.id;
                  const count = tabCounts[tab.id];
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      onClick={() => setFamilyTab(tab.id)}
                      className={clsx(
                        "min-h-[2.75rem] rounded-lg px-4 text-base font-black transition duration-200 sm:px-5 sm:text-lg",
                        selected
                          ? theme.id === "rocket"
                            ? "bg-[#E53935] text-white shadow-md"
                            : "bg-[#2563EB] text-white shadow-md"
                          : theme.id === "rocket"
                            ? "text-[#CBD5E1] hover:bg-[#1a2030] hover:text-white"
                            : "text-slate-600 hover:bg-white hover:text-slate-900",
                      )}
                    >
                      {tab.label}
                      <span
                        className={clsx(
                          "ml-2 text-sm font-bold tabular-nums",
                          selected ? "text-white/90" : theme.contentMuted,
                        )}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </nav>

              <p className={clsx("mb-5 text-base font-semibold", theme.contentMuted)}>
                {BRAND_HUB_FAMILY_TABS.find((t) => t.id === familyTab)?.label} · {products.length}개
                규격
              </p>

              {products.length === 0 ? (
                <p
                  className={clsx(
                    "rounded-xl border border-dashed px-6 py-12 text-center text-lg font-semibold",
                    theme.id === "rocket"
                      ? "border-[#2d3544] text-[#AEB8C6]"
                      : "border-slate-200 text-slate-500",
                  )}
                >
                  이 분류에 등록된 제품이 없습니다.
                </p>
              ) : (
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
              )}
            </section>

            <div
              className={clsx(
                "mx-auto max-w-2xl space-y-2 pt-4 text-center text-sm font-medium leading-relaxed sm:text-base",
                theme.contentMuted,
              )}
            >
              <p>{BRAND_HUB_CCA_RC_GUIDE.cca}</p>
              <p>{BRAND_HUB_CCA_RC_GUIDE.rc}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <section
        className={`${bm.card} ${bm.cardPad} space-y-5`}
        aria-labelledby="brand-hub-reference-title"
      >
        <header>
          <p className={bm.intentBadge}>참고 브랜드</p>
          <h2 id="brand-hub-reference-title" className={`${bm.sectionTitle} mt-2`}>
            함께 비교하는 브랜드
          </h2>
          <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">
            상담 시 로케트·쏠라이트 외에도 아래 브랜드를 규격 비교용으로 안내할 수 있습니다.
          </p>
        </header>
        <div className="grid gap-4 md:grid-cols-2">
          {BRAND_HUB_REFERENCE_BRANDS.map((ref) => (
            <article
              key={ref.id}
              className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 ring-1 ring-slate-100"
            >
              <h3 className="text-lg font-black text-slate-950">{ref.title}</h3>
              <p className="mt-2 text-sm font-bold text-slate-800">{ref.headline}</p>
              <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">
                {ref.description}
              </p>
              <ul className="mt-3 space-y-1.5 text-sm font-medium text-slate-700">
                {ref.advantageBullets.map((b) => (
                  <li key={b} className="flex gap-2">
                    <span className="text-blue-600" aria-hidden>
                      ·
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
              <p className="mt-4 rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-600 ring-1 ring-slate-100">
                <span className="font-black text-slate-800">현장 코멘트 · </span>
                {ref.fieldComment}
              </p>
            </article>
          ))}
        </div>
      </section>
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
  const presentation = getBrandHubLogoPresentation(brandId);
  const [imgError, setImgError] = useState(false);
  const logoSrc = brandHubBannerLogoSrc(brandId);

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
      src={logoSrc}
      alt={assets.alt}
      width={assets.width}
      height={assets.height}
      className={clsx("brand-hub-logo-image", presentation.imageClassName)}
      sizes="(max-width: 639px) 100vw, (max-width: 1023px) 22rem, 36rem"
      priority
      onError={() => setImgError(true)}
    />
  );

  return (
    <div
      className="brand-hub-logo-badge shrink-0"
      data-brand-logo-plaque={brandId}
      data-logo-panel={presentation.panelVariant}
    >
      <div className={theme.logoGlass}>
        <div className={clsx("brand-hub-logo-image-surface", presentation.surfaceClassName)}>
          {logo}
        </div>
      </div>
    </div>
  );
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
      <div className="relative z-10 flex min-w-0 flex-1 flex-col justify-center gap-0">
        <BrandHubBannerLogo brandId={brandId} theme={theme} fallbackTitle={banner.title} />
        <p className={clsx("mt-5 text-xl font-bold leading-snug sm:mt-6 sm:text-2xl", theme.bannerText)}>
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
            <h3 className={clsx("mt-2 text-2xl font-black leading-snug sm:text-3xl", theme.insightTitle)}>
              {card.lead}
            </h3>
            <p className={clsx("mt-3 text-lg font-medium leading-relaxed", theme.insightBody)}>
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
              <span className={theme.insightBullet}>{b}</span>
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
          <p className={clsx("px-3 text-center text-base font-bold", theme.contentMuted)}>
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
        <p className={clsx("text-xl font-black tracking-tight sm:text-2xl", theme.contentTitle)}>
          {card.displayCode}
        </p>
        {card.manufacturerLine ? (
          <p className={clsx("mt-1.5 text-sm font-semibold", labelMuted)}>{card.manufacturerLine}</p>
        ) : null}
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
          <p className={clsx("mt-1.5 text-base font-semibold leading-snug tabular-nums", theme.contentTitle)}>
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
      <dd className={clsx("text-lg font-bold tabular-nums", theme.contentTitle)}>{value}</dd>
    </div>
  );
}
