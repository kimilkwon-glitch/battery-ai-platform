/**
 * Battery Manager — Precision Garage Platform design tokens (Tailwind class strings)
 */

export const bm = {
  /** 은은한 그리드·글로우 배경 (globals .bm-page-mesh) */
  pageBg: "bm-page-mesh min-h-screen text-[var(--bm-text)]",
  pageBgPlain: "min-h-screen bg-[var(--bm-page-bg)] text-[var(--bm-text)]",
  pageContainer: "mx-auto max-w-[1280px] px-4 py-5 sm:px-5",
  pageContainerWide: "mx-auto max-w-[1440px] px-4 py-5 lg:px-6",
  sectionGap: "space-y-5",
  section: "space-y-4",

  card:
    "bm-card-surface rounded-[22px] border border-[var(--bm-border)] bg-[var(--bm-card)] shadow-[var(--bm-shadow-sm)]",
  cardPad: "p-4 sm:p-5",
  cardPremium:
    "bm-card-surface rounded-[22px] border border-[var(--bm-border)] bg-gradient-to-b from-white to-[var(--bm-surface-muted)] shadow-[var(--bm-shadow-md)] ring-1 ring-white/80",
  cardInteractive:
    "bm-card-surface rounded-[22px] border border-[var(--bm-border)] bg-[var(--bm-card)] shadow-[var(--bm-shadow-sm)] transition duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-[var(--bm-primary)]/25 motion-safe:hover:shadow-[var(--bm-shadow-md)]",

  /** 검색·fitment 판정 카드 */
  fitmentCard:
    "overflow-hidden rounded-[22px] border border-[var(--bm-border)] bg-[var(--bm-card)] shadow-[var(--bm-shadow-sm)] transition duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-[var(--bm-primary)]/20 motion-safe:hover:shadow-[var(--bm-shadow-md)]",
  fitmentCardPrimary:
    "bm-card-surface overflow-hidden rounded-[22px] border-2 border-[var(--bm-navy)]/12 bg-gradient-to-br from-white via-white to-[var(--bm-hero-from)] shadow-[var(--bm-shadow-md)] ring-1 ring-[var(--bm-primary)]/10 transition duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-[var(--bm-shadow-lg)]",
  reportCard:
    "bm-card-surface overflow-hidden rounded-[22px] border border-[var(--bm-border)] bg-[var(--bm-card)] shadow-[var(--bm-shadow-md)]",
  reportCardHeader:
    "border-b border-[var(--bm-border)] bg-gradient-to-r from-[var(--bm-hero-from)] via-white to-[var(--bm-accent-soft)]/30 px-5 py-4",
  compareSpecCol:
    "bm-card-surface flex flex-1 flex-col overflow-hidden rounded-[22px] border border-[var(--bm-border)] bg-gradient-to-b from-white to-[var(--bm-surface-muted)] shadow-[var(--bm-shadow-sm)]",

  intentSummary:
    "rounded-[22px] border border-[var(--bm-border)] bg-[var(--bm-surface-soft)] p-4 sm:p-5 shadow-[var(--bm-shadow-sm)] backdrop-blur-sm",
  intentBadge:
    "inline-flex items-center rounded-lg bg-[var(--bm-navy)]/[0.04] px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.08em] text-[var(--bm-primary-dark)] ring-1 ring-[var(--bm-border)]",

  /** 메인 hero H1 — Pretendard 700 (선명도 우선) */
  heroDisplay:
    "bm-section-title text-[1.65rem] leading-[1.25] text-[var(--bm-text)] sm:text-[2rem] lg:text-[2.1rem]",
  heroLead:
    "text-base font-bold leading-relaxed tracking-normal text-[var(--bm-primary-dark)] sm:text-lg",
  /** 페이지·섹션 제목 공통 (전 페이지 SectionHeader·PageShell) */
  sectionTitle:
    "bm-section-title text-lg leading-snug text-[var(--bm-text)] sm:text-xl",
  sectionTitleLg:
    "bm-section-title text-xl leading-snug text-[var(--bm-text)] sm:text-2xl",
  titleLg: "bm-section-title text-xl leading-snug text-[var(--bm-text)] sm:text-2xl",
  specData:
    "spec-code text-xs font-bold tabular-nums tracking-wide text-[var(--bm-muted)]",
  titleMd: "bm-section-title text-lg leading-snug text-[var(--bm-text)] sm:text-xl",
  cardTitle: "text-sm font-bold leading-snug text-[var(--bm-text)]",
  specTitle: "spec-code text-xl font-bold tracking-normal text-[var(--bm-text)] sm:text-2xl",
  sectionHead: "bm-section-head",
  sectionBlock:
    "bm-card-surface overflow-visible rounded-[22px] border border-[var(--bm-border)] bg-[var(--bm-card)] shadow-[var(--bm-shadow-md)]",
  sectionBlockPad: "p-4 sm:p-5",
  rankCard:
    "overflow-hidden rounded-[18px] border border-[var(--bm-border)] bg-[var(--bm-card)] shadow-[var(--bm-shadow-sm)] transition duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-[var(--bm-primary)]/20 motion-safe:hover:shadow-[var(--bm-shadow-md)]",
  textSub: "text-sm font-medium leading-relaxed text-[var(--bm-muted)]",
  muted: "text-[var(--bm-muted)]",
  label:
    "text-[11px] font-bold uppercase tracking-[0.04em] text-[var(--bm-primary)]",

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

  /** 배터리 상품 카드 하단·CTA — 이미지보다 약하게 */
  batteryCardBody:
    "flex flex-1 flex-col gap-0.5 border-t border-slate-100 px-2 pb-1.5 pt-1",
  batteryCardBtnRow: "mt-0.5 flex flex-wrap gap-1",
  btnCardNavy:
    "inline-flex min-h-[34px] items-center justify-center rounded-lg bg-[var(--bm-navy)] px-2.5 py-1 text-[9px] font-black text-white transition motion-safe:hover:bg-slate-800",
  btnCardSecondary:
    "inline-flex min-h-[34px] items-center justify-center rounded-lg border border-[var(--bm-border)] bg-[var(--bm-card)] px-2.5 py-1 text-[9px] font-black text-[var(--bm-text)] transition motion-safe:hover:border-[var(--bm-accent)]/40 motion-safe:hover:bg-[var(--bm-accent-soft)]",
  btnCardGhost:
    "inline-flex min-h-[34px] items-center justify-center rounded-lg px-2 py-1 text-[9px] font-bold text-[var(--bm-muted)] ring-1 ring-[var(--bm-border)] transition motion-safe:hover:bg-white motion-safe:hover:text-[var(--bm-text)]",
  btnWarning:
    "inline-flex min-h-[44px] items-center justify-center rounded-xl border border-orange-200 bg-[var(--bm-warning-bg)] px-5 text-sm font-black text-orange-900 transition motion-safe:hover:border-orange-300 motion-safe:hover:bg-orange-50",
  btnDanger:
    "inline-flex min-h-[44px] items-center justify-center rounded-xl border border-red-200 bg-[var(--bm-danger-bg)] px-5 text-sm font-black text-red-800 transition motion-safe:hover:border-red-300",
  chipExample:
    "rounded-full border border-[var(--bm-border)] bg-[var(--bm-card)] px-3 py-1.5 text-[11px] font-bold text-[var(--bm-text)] shadow-[var(--bm-shadow-sm)] transition motion-safe:hover:-translate-y-px motion-safe:hover:border-[var(--bm-accent)]/40 motion-safe:hover:shadow-[var(--bm-shadow-sm)]",
  tabBtn:
    "shrink-0 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-black text-[var(--bm-muted)] ring-1 ring-[var(--bm-border)] bg-[var(--bm-surface-muted)] transition duration-200 motion-safe:hover:bg-white motion-safe:hover:text-[var(--bm-text)]",
  tabBtnActive:
    "shrink-0 whitespace-nowrap rounded-xl bg-[var(--bm-navy)] px-4 py-2.5 text-xs font-black text-white shadow-[var(--bm-shadow-sm)] ring-1 ring-[var(--bm-navy)]",
  nextStepCard:
    "bm-card-surface group block rounded-[18px] border border-[var(--bm-border)] bg-gradient-to-br from-white to-[var(--bm-surface-muted)] p-3 shadow-[var(--bm-shadow-sm)] transition duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-[var(--bm-primary)]/30 motion-safe:hover:shadow-[var(--bm-shadow-md)]",
  searchInset:
    "rounded-[20px] border border-[var(--bm-border)] bg-[var(--bm-card)] p-1 shadow-[var(--bm-shadow-md)] ring-1 ring-[var(--bm-primary)]/5",

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

  /** 레거시 — 신규 카드는 BatteryImageStage 사용 */
  imageBattery:
    "relative flex h-[180px] w-full items-center justify-center overflow-hidden rounded-xl bg-[var(--bm-image-bg)] ring-1 ring-[var(--bm-border)]",
  imageBatteryCompact:
    "relative flex h-[140px] w-full items-center justify-center overflow-hidden rounded-xl bg-[var(--bm-image-bg)] ring-1 ring-[var(--bm-border)] sm:h-[160px]",
  /** @see battery-image-stage.ts */
  batteryImageStageBase:
    "battery-image-stage relative w-full overflow-hidden bg-[var(--bm-image-bg)] ring-1 ring-[var(--bm-border)]/80",
  imageVehicle:
    "relative flex h-[105px] w-[150px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--bm-card)] ring-1 ring-[var(--bm-border)]",
  imageVehicleCommercial:
    "relative flex h-[105px] w-[165px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--bm-card)] ring-1 ring-[var(--bm-border)]",
  imageContain: "max-h-full max-w-full object-contain object-center",

  warningPanel:
    "rounded-[22px] border border-orange-100/80 bg-[var(--bm-warning-bg)] p-4 sm:p-5 shadow-[var(--bm-shadow-sm)]",
  heroPanel:
    "bm-card-surface overflow-hidden rounded-[22px] border border-[var(--bm-border)] bg-[var(--bm-card)] shadow-[var(--bm-shadow-lg)] ring-1 ring-white/60",
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
