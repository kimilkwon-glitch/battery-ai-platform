/**
 * Battery Manager — unified design tokens (Tailwind class strings)
 */

export const bm = {
  pageBg: "min-h-screen bg-[var(--bm-page-bg)] text-[var(--bm-text)]",
  pageContainer: "mx-auto max-w-[1280px] px-4 py-5 sm:px-5",
  pageContainerWide: "mx-auto max-w-[1440px] px-4 py-5 lg:px-6",
  sectionGap: "space-y-5",

  card:
    "rounded-2xl border border-[var(--bm-border)] bg-[var(--bm-card)] shadow-[var(--bm-shadow-sm)]",
  cardPad: "p-4 sm:p-5",
  cardInteractive:
    "rounded-2xl border border-[var(--bm-border)] bg-[var(--bm-card)] shadow-[var(--bm-shadow-sm)] transition duration-200 hover:border-blue-200 hover:shadow-[var(--bm-shadow-sm)]",

  titleLg: "text-xl font-black tracking-tight text-[var(--bm-text)] sm:text-2xl",
  titleMd: "text-lg font-black tracking-tight text-[var(--bm-text)]",
  cardTitle: "text-sm font-black leading-snug text-slate-950",

  btnPrimary:
    "inline-flex h-11 items-center justify-center rounded-xl bg-[var(--bm-primary)] px-5 text-sm font-black text-white shadow-sm transition hover:bg-[var(--bm-primary-hover)]",
  btnSecondary:
    "inline-flex h-11 items-center justify-center rounded-xl border border-[var(--bm-border)] bg-white px-5 text-sm font-black text-slate-800 transition hover:border-blue-200 hover:bg-blue-50/60",
  btnTertiary:
    "inline-flex items-center justify-center px-1 text-sm font-bold text-[var(--bm-primary)] underline-offset-2 transition hover:underline",
  btnNavy:
    "inline-flex h-10 items-center justify-center rounded-xl bg-[var(--bm-navy)] px-4 text-xs font-black text-white transition hover:bg-slate-800",
  btnGhost:
    "inline-flex h-9 items-center justify-center rounded-lg px-3 text-[11px] font-bold text-slate-600 ring-1 ring-slate-200/80 transition hover:bg-slate-50",

  badge:
    "inline-flex items-center rounded-md px-1.5 py-px text-[9px] font-semibold ring-1",
  badgeBlue: "bg-blue-50/80 text-blue-600/90 ring-blue-100/80",
  badgeGreen: "bg-emerald-50/80 text-emerald-700/90 ring-emerald-100/70",
  badgeAmber: "bg-amber-50/70 text-amber-800/90 ring-amber-100/60",
  badgeGray: "bg-slate-50 text-slate-500 ring-slate-100",

  muted: "text-[var(--bm-muted)]",
  label: "text-[11px] font-black uppercase tracking-[0.06em] text-[var(--bm-primary)]",

  imageBattery: "relative flex h-[180px] w-full items-center justify-center overflow-hidden bg-[var(--bm-image-bg)]",
  imageVehicle: "relative flex h-[105px] w-[150px] shrink-0 items-center justify-center overflow-hidden bg-white",
  imageVehicleCommercial: "relative flex h-[105px] w-[165px] shrink-0 items-center justify-center overflow-hidden bg-white",
  imageContain: "max-h-full max-w-full object-contain object-center",

  warningPanel:
    "rounded-2xl border border-amber-100/70 bg-[var(--bm-warning-bg)] p-4 sm:p-5 shadow-[var(--bm-shadow-sm)]",
  heroPanel:
    "overflow-hidden rounded-2xl border border-blue-100/60 bg-white shadow-[var(--bm-shadow-sm)]",
  surfaceMuted: "rounded-xl border border-slate-100 bg-slate-50/50",

  input:
    "h-10 w-full rounded-xl border border-[var(--bm-border)] bg-slate-50/80 px-3 text-sm font-semibold outline-none transition focus:border-[var(--bm-primary)] focus:bg-white focus:ring-2 focus:ring-blue-100",
} as const;

/** @deprecated use bm.cardInteractive — kept for existing imports */
export const productCardShell = bm.cardInteractive;
export const batteryThumbSurface = "bg-[var(--bm-image-bg)]";
export const vehicleCardShell =
  "group flex min-h-[105px] items-center overflow-hidden rounded-2xl border border-[var(--bm-border)] bg-[var(--bm-card)] shadow-[var(--bm-shadow-sm)] transition duration-200 hover:border-blue-200";
export const vehicleImageBoxClass = bm.imageVehicle;
export const vehicleImageBoxCommercialClass = bm.imageVehicleCommercial;
export const vehicleImageImgClass = "block h-[92%] w-[92%] object-contain object-center";
export const vehicleImageImgCommercialClass = "block h-[90%] w-[90%] object-contain object-center";
export const vehicleCardTextCol = "flex min-w-0 flex-1 flex-col justify-center gap-1 py-2.5 pl-3 pr-3";
export const productCardPadding = "p-4";
export const carHeroSurface = "bg-white";
export const carSurface = "bg-white";
export const carImageCompactClass = "h-full w-full object-contain object-center";
export const carImageEdgeSoftenFilter = "brightness(1.01)";
export const carThumbPlaceholderClass =
  "relative flex h-[105px] w-[150px] shrink-0 items-center justify-center overflow-hidden bg-white text-slate-400";
export const CAR_IMAGE_FALLBACK = "/fallback/car-placeholder.svg";
