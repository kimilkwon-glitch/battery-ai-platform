/**
 * Battery Manager — Precision Garage Platform design tokens (Tailwind class strings)
 */

export const bm = {
  pageBg: "min-h-screen bg-[var(--bm-page-bg)] text-[var(--bm-text)]",
  pageContainer: "mx-auto max-w-[1280px] px-4 py-5 sm:px-5",
  pageContainerWide: "mx-auto max-w-[1440px] px-4 py-5 lg:px-6",
  sectionGap: "space-y-5",
  section: "space-y-4",

  card:
    "rounded-[22px] border border-[var(--bm-border)] bg-[var(--bm-card)] shadow-[var(--bm-shadow-sm)]",
  cardPad: "p-4 sm:p-5",
  cardInteractive:
    "rounded-[22px] border border-[var(--bm-border)] bg-[var(--bm-card)] shadow-[var(--bm-shadow-sm)] transition duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-[var(--bm-primary)]/25 motion-safe:hover:shadow-[var(--bm-shadow-md)]",

  /** 검색·fitment 판정 카드 */
  fitmentCard:
    "overflow-hidden rounded-[22px] border border-[var(--bm-border)] bg-[var(--bm-card)] shadow-[var(--bm-shadow-sm)] transition duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-[var(--bm-primary)]/20 motion-safe:hover:shadow-[var(--bm-shadow-md)]",
  fitmentCardPrimary:
    "overflow-hidden rounded-[22px] border-2 border-[var(--bm-navy)]/12 bg-[var(--bm-card)] shadow-[var(--bm-shadow-md)] ring-1 ring-[var(--bm-primary)]/8 transition duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-[var(--bm-shadow-lg)]",

  intentSummary:
    "rounded-[22px] border border-[var(--bm-border)] bg-[var(--bm-surface-soft)] p-4 sm:p-5 shadow-[var(--bm-shadow-sm)] backdrop-blur-sm",
  intentBadge:
    "inline-flex items-center rounded-lg bg-[var(--bm-navy)]/[0.04] px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.08em] text-[var(--bm-primary-dark)] ring-1 ring-[var(--bm-border)]",

  titleLg:
    "font-heading text-xl font-black tracking-[-0.02em] text-[var(--bm-text)] sm:text-2xl",
  titleMd: "font-heading text-lg font-black tracking-[-0.02em] text-[var(--bm-text)]",
  cardTitle: "text-sm font-black leading-snug text-[var(--bm-text)]",
  specTitle: "spec-code text-xl font-black tracking-tight text-[var(--bm-text)] sm:text-2xl",
  textSub: "text-sm font-medium leading-relaxed text-[var(--bm-muted)]",
  muted: "text-[var(--bm-muted)]",
  label:
    "text-[11px] font-black uppercase tracking-[0.06em] text-[var(--bm-primary)]",

  btnPrimary:
    "inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[var(--bm-primary)] px-5 text-sm font-black text-white shadow-sm transition motion-safe:hover:bg-[var(--bm-primary-hover)] motion-safe:hover:shadow-[var(--bm-shadow-sm)]",
  btnSecondary:
    "inline-flex min-h-[44px] items-center justify-center rounded-xl border border-[var(--bm-border)] bg-[var(--bm-card)] px-5 text-sm font-black text-[var(--bm-text)] transition motion-safe:hover:border-[var(--bm-accent)]/40 motion-safe:hover:bg-[var(--bm-accent-soft)]",
  btnTertiary:
    "inline-flex min-h-[40px] items-center justify-center px-1 text-sm font-bold text-[var(--bm-primary)] underline-offset-2 transition motion-safe:hover:underline",
  btnNavy:
    "inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[var(--bm-navy)] px-5 text-sm font-black text-white transition motion-safe:hover:bg-slate-800",
  btnAccent:
    "inline-flex min-h-[44px] items-center justify-center rounded-xl border border-[var(--bm-accent)]/35 bg-[var(--bm-accent-soft)] px-5 text-sm font-black text-cyan-900 transition motion-safe:hover:border-[var(--bm-accent)] motion-safe:hover:bg-cyan-50",
  btnGhost:
    "inline-flex min-h-[40px] items-center justify-center rounded-lg px-3 text-[11px] font-bold text-[var(--bm-muted)] ring-1 ring-[var(--bm-border)] transition motion-safe:hover:bg-white motion-safe:hover:text-[var(--bm-text)]",

  badge:
    "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold ring-1",
  badgeBlue: "bg-blue-50/90 text-blue-800 ring-blue-100/80",
  badgeGreen: "bg-emerald-50/90 text-emerald-800 ring-emerald-100/70",
  badgeAmber: "bg-orange-50/90 text-orange-800 ring-orange-100/70",
  badgeCyan: "bg-cyan-50/90 text-cyan-900 ring-cyan-100/80",
  badgeRed: "bg-red-50/90 text-red-700 ring-red-100/80",
  badgeGray: "bg-slate-50 text-slate-600 ring-slate-200/80",
  badgeNavy: "bg-[var(--bm-navy)]/5 text-[var(--bm-primary-dark)] ring-[var(--bm-border)]",

  /** fitment 판정 배지 */
  statusRecommended: "bg-blue-50/90 text-blue-800 ring-blue-100/80",
  statusOk: "bg-emerald-50/90 text-emerald-800 ring-emerald-100/70",
  statusSubstitute: "bg-cyan-50/90 text-cyan-900 ring-cyan-100/80",
  statusCheck: "bg-orange-50/90 text-orange-800 ring-orange-100/70",
  statusWarn: "bg-red-50/90 text-red-700 ring-red-100/80",

  imageBattery:
    "relative flex h-[180px] w-full items-center justify-center overflow-hidden rounded-xl bg-[var(--bm-image-bg)] ring-1 ring-[var(--bm-border)]",
  imageBatteryCompact:
    "relative flex h-[140px] w-full items-center justify-center overflow-hidden rounded-xl bg-[var(--bm-image-bg)] ring-1 ring-[var(--bm-border)] sm:h-[160px]",
  imageVehicle:
    "relative flex h-[105px] w-[150px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--bm-card)] ring-1 ring-[var(--bm-border)]",
  imageVehicleCommercial:
    "relative flex h-[105px] w-[165px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--bm-card)] ring-1 ring-[var(--bm-border)]",
  imageContain: "max-h-full max-w-full object-contain object-center",

  warningPanel:
    "rounded-[22px] border border-orange-100/80 bg-[var(--bm-warning-bg)] p-4 sm:p-5 shadow-[var(--bm-shadow-sm)]",
  heroPanel:
    "overflow-hidden rounded-[22px] border border-[var(--bm-border)] bg-[var(--bm-card)] shadow-[var(--bm-shadow-md)]",
  heroPanelAccent:
    "border-b border-[var(--bm-border)] bg-gradient-to-r from-[var(--bm-hero-from)] to-[var(--bm-card)] px-5 py-3 lg:px-7",
  surfaceMuted:
    "rounded-xl border border-[var(--bm-border)] bg-[var(--bm-surface-muted)]",
  platformStrip:
    "rounded-[22px] border border-[var(--bm-border)] bg-[var(--bm-surface-soft)] p-4 shadow-[var(--bm-shadow-sm)] backdrop-blur-sm sm:p-5",

  input:
    "h-11 w-full rounded-xl border border-[var(--bm-border)] bg-[var(--bm-surface-muted)] px-3 text-sm font-semibold text-[var(--bm-text)] outline-none transition focus:border-[var(--bm-primary)] focus:bg-white focus:ring-2 focus:ring-blue-100/80",

  stickyMobileBar:
    "fixed inset-x-0 bottom-0 z-40 border-t border-[var(--bm-border)] bg-[var(--bm-surface-soft)] px-3 py-2.5 shadow-[0_-10px_28px_rgba(15,23,42,0.1)] backdrop-blur-md md:hidden",
} as const;

/** @deprecated use bm.cardInteractive */
export const productCardShell = bm.cardInteractive;
export const batteryThumbSurface = "bg-[var(--bm-image-bg)]";
export const vehicleCardShell =
  "group flex min-h-[105px] items-center overflow-hidden rounded-[22px] border border-[var(--bm-border)] bg-[var(--bm-card)] shadow-[var(--bm-shadow-sm)] transition duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-[var(--bm-primary)]/25";
export const vehicleImageBoxClass = bm.imageVehicle;
export const vehicleImageBoxCommercialClass = bm.imageVehicleCommercial;
export const vehicleImageImgClass = "block h-[92%] w-[92%] object-contain object-center";
export const vehicleImageImgCommercialClass = "block h-[90%] w-[90%] object-contain object-center";
export const vehicleCardTextCol =
  "flex min-w-0 flex-1 flex-col justify-center gap-1 py-2.5 pl-3 pr-3";
export const productCardPadding = "p-4";
export const carHeroSurface = "bg-[var(--bm-card)]";
export const carSurface = "bg-[var(--bm-card)]";
export const carImageCompactClass = "h-full w-full object-contain object-center";
export const carImageEdgeSoftenFilter = "brightness(1.01)";
export const carThumbPlaceholderClass =
  "relative flex h-[105px] w-[150px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--bm-card)] text-slate-400 ring-1 ring-[var(--bm-border)]";
export const CAR_IMAGE_FALLBACK = "/fallback/car-placeholder.svg";
