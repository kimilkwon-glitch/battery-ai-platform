/**
 * Battery Manager — Design System P2 (Precision Garage Platform)
 */

export type SectionRhythm =
  | "hero"
  | "catalog"
  | "vehicle"
  | "ev"
  | "symptom"
  | "delivery"
  | "service"
  | "tools"
  | "qna"
  | "order";

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
    "rounded-[22px] border border-[var(--bm-border)] bg-[var(--bm-surface-soft)] p-4 sm:p-5 shadow-[var(--bm-shadow-sm)]",
  intentBadge:
    "inline-flex items-center rounded-lg bg-[var(--bm-surface-blue)] px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-[var(--bm-primary)] ring-1 ring-[var(--bm-border-blue)]",

  /** 타이포 스케일 — eyebrow / hero / section / card / badge / button */
  typoEyebrow:
    "text-xs font-semibold uppercase tracking-wide text-[var(--bm-primary)] sm:text-sm",
  typoCaption: "text-xs font-medium leading-snug text-[var(--bm-text-sub)] sm:text-sm",
  /** 메인 hero H1 — mobile ~3xl, desktop ≤5xl 권장 상한 */
  heroDisplay:
    "bm-section-title text-3xl leading-[1.2] text-[var(--bm-text)] sm:text-4xl lg:text-[2.75rem]",
  heroLead:
    "text-base font-semibold leading-relaxed tracking-normal text-[var(--bm-primary-dark)] sm:text-lg",
  /** 페이지·섹션 제목 (SectionHeader 기본) */
  sectionTitle:
    "bm-section-title text-xl leading-snug text-[var(--bm-text)] sm:text-2xl",
  sectionTitleLg:
    "bm-section-title text-2xl leading-snug text-[var(--bm-text)] sm:text-3xl",
  titleLg: "bm-section-title text-2xl leading-snug text-[var(--bm-text)] sm:text-3xl",
  specData:
    "spec-code text-xs font-bold tabular-nums tracking-wide text-slate-600 sm:text-sm",
  titleMd: "bm-section-title text-xl leading-snug text-[var(--bm-text)] sm:text-2xl",
  cardTitle: "text-base font-bold leading-snug text-[var(--bm-text)] sm:text-lg",
  specTitle: "spec-code text-xl font-bold tracking-normal text-[var(--bm-text)] sm:text-2xl",
  sectionHead: "bm-section-head",
  sectionBlock:
    "bm-card-surface overflow-visible rounded-[22px] border border-[var(--bm-border)] bg-[var(--bm-card)] shadow-[var(--bm-shadow-md)]",
  sectionBlockPad: "p-4 sm:p-5",
  rankCard:
    "bm-card-battery-product flex flex-col overflow-hidden",
  /** P2 card types */
  cardBatteryProduct: "bm-card-battery-product bm-card-horizontal overflow-hidden",
  cardVehicleMatch: "bm-card-vehicle-match bm-card-horizontal overflow-hidden",
  cardHorizontal:
    "flex flex-col overflow-hidden md:grid md:grid-cols-[44%_56%] md:items-stretch",
  cardHorizontalMedia:
    "bm-card-horizontal__media flex min-h-[132px] shrink-0 items-center justify-center border-b border-slate-100 bg-[var(--bm-image-bg)] p-1.5 md:min-h-[156px] md:border-b-0 md:border-r md:p-2",
  cardHorizontalBody:
    "bm-card-horizontal__body flex min-h-[132px] min-w-0 flex-1 flex-col justify-between gap-0 p-4 md:min-h-[156px] md:p-5",
  cardInfoStack: "flex min-w-0 flex-1 flex-col gap-1.5",
  cardInfoTitleRow: "flex items-center gap-2",
  cardInfoIconBadge:
    "inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-[var(--bm-surface-blue)] ring-1 ring-[var(--bm-border-blue)]",
  cardInfoTitle:
    "text-base font-bold leading-tight text-[var(--bm-text)] group-hover:text-[var(--bm-primary)]",
  cardInfoSpec: "spec-code text-sm font-bold leading-none text-[var(--bm-primary)]",
  cardInfoDesc: "text-sm font-medium leading-snug text-[var(--bm-text-sub)] line-clamp-2",
  cardInfoBadgeRow: "flex flex-wrap gap-1.5",
  cardInfoMeta: "text-xs font-medium leading-snug text-[var(--bm-text-muted)] line-clamp-2",
  cardInfoActions: "mt-3 flex shrink-0 flex-wrap items-center gap-2",
  cardInfoCtaLink:
    "inline-flex items-center gap-1 rounded-lg bg-[var(--bm-surface-blue)] px-2.5 py-1.5 text-xs font-bold text-[var(--bm-primary)] ring-1 ring-[var(--bm-border-blue)] transition group-hover:bg-[var(--bm-info-soft)] group-hover:ring-[var(--bm-primary)]/30",
  cardSymptom: "bm-card-symptom flex flex-col p-4",
  cardPhotoCheck: "bm-card-photo-check",
  cardServiceStore: "bm-card-service-store",
  cardQna: "bm-card-qna",
  sectionRhythm: "bm-section-rhythm bm-section-enter",
  sectionRhythmHero: "bm-section-rhythm bm-section-rhythm--hero",
  sectionRhythmCatalog: "bm-section-rhythm bm-section-rhythm--catalog",
  sectionRhythmVehicle: "bm-section-rhythm bm-section-rhythm--vehicle",
  sectionRhythmEv: "bm-section-rhythm bm-section-rhythm--ev",
  sectionRhythmSymptom: "bm-section-rhythm bm-section-rhythm--symptom",
  sectionRhythmDelivery: "bm-section-rhythm bm-section-rhythm--delivery",
  sectionRhythmService: "bm-section-rhythm bm-section-rhythm--service",
  sectionRhythmTools: "bm-section-rhythm bm-section-rhythm--tools",
  sectionRhythmQna: "bm-section-rhythm bm-section-rhythm--qna",
  sectionRhythmOrder: "bm-section-rhythm bm-section-rhythm--order",
  heroDark: "bm-hero-dark",
  heroDarkAccent: "bm-hero-dark-accent",
  heroLeadP2: "text-base font-semibold leading-relaxed text-[var(--bm-text-on-dark-sub)] sm:text-lg",
  heroMuted: "text-[var(--bm-text-on-dark-sub)]",
  heroPreviewPanel: "bm-hero-dark-side",
  hubPhoto: "bm-hub-rhythm--photo space-y-5",
  hubSymptom: "bm-hub-rhythm--symptom space-y-5",
  hubServicePage: "bm-hub-rhythm--service-page space-y-5",
  hubOrder: "bm-hub-rhythm--order space-y-5",
  hubCatalog: "bm-hub-rhythm--catalog space-y-5",
  alertInfo: "bm-alert-info text-sm font-medium text-slate-700",
  alertWarn: "bm-alert-warn text-sm font-medium text-amber-950",
  alertSuccess: "bm-alert-success text-sm font-medium text-emerald-900",
  stepItem: "bm-step-item",
  stepNum: "bm-step-num",
  textSub: "text-sm font-medium leading-relaxed text-[var(--bm-text-sub)] sm:text-base",
  muted: "text-[var(--bm-text-muted)]",
  label: "text-xs font-semibold uppercase tracking-wide text-[var(--bm-primary)] sm:text-sm",

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
    "inline-flex min-h-9 items-center justify-center rounded-lg px-3 text-xs font-bold text-slate-700 ring-1 ring-[var(--bm-border)] transition motion-safe:hover:bg-white motion-safe:hover:text-[var(--bm-text)]",

  /** 배터리 상품 카드 하단·CTA — 이미지보다 약하게 */
  batteryCardBody:
    "flex flex-1 flex-col gap-1 border-t border-slate-100 px-2.5 pb-2 pt-1.5 md:border-t-0 md:px-0 md:pb-0 md:pt-0",
  batteryCardBtnRow: "flex flex-wrap items-center gap-2",
  btnCardNavy:
    "inline-flex h-9 min-h-9 items-center justify-center rounded-lg bg-[var(--bm-navy)] px-3 text-xs font-bold text-white transition motion-safe:hover:bg-slate-800 sm:text-sm",
  btnCardSecondary:
    "inline-flex h-9 min-h-9 items-center justify-center rounded-lg border border-[var(--bm-border)] bg-[var(--bm-card)] px-3 text-xs font-bold text-[var(--bm-text)] transition motion-safe:hover:border-[var(--bm-accent)]/40 motion-safe:hover:bg-[var(--bm-accent-soft)] sm:text-sm",
  btnCardGhost:
    "inline-flex h-9 min-h-9 items-center justify-center rounded-lg px-2.5 text-xs font-semibold text-slate-700 ring-1 ring-[var(--bm-border)] transition motion-safe:hover:bg-white motion-safe:hover:text-[var(--bm-text)]",
  btnWarning:
    "inline-flex min-h-[44px] items-center justify-center rounded-xl border border-orange-200 bg-[var(--bm-warning-bg)] px-5 text-sm font-black text-orange-900 transition motion-safe:hover:border-orange-300 motion-safe:hover:bg-orange-50",
  btnDanger:
    "inline-flex min-h-[44px] items-center justify-center rounded-xl border border-red-200 bg-[var(--bm-danger-bg)] px-5 text-sm font-black text-red-800 transition motion-safe:hover:border-red-300",
  chipExample:
    "rounded-full border border-[var(--bm-border)] bg-[var(--bm-card)] px-3 py-1.5 text-xs font-bold text-[var(--bm-text)] shadow-[var(--bm-shadow-sm)] transition motion-safe:hover:-translate-y-px motion-safe:hover:border-[var(--bm-accent)]/40 motion-safe:hover:shadow-[var(--bm-shadow-sm)]",
  /** 필터·연식·연료 칩 — badge보다 강조, 카드 CTA보다 작음 */
  filterChipRowLabel: "w-[4.25rem] shrink-0 text-xs font-semibold text-[var(--bm-text-sub)] sm:w-16",
  filterChip:
    "inline-flex min-h-8 items-center justify-center rounded-full px-2.5 py-1.5 text-xs font-bold leading-none transition sm:px-3",
  filterChipOn:
    "bg-[var(--bm-primary)] text-white shadow-sm ring-1 ring-[var(--bm-primary)] hover:bg-[var(--bm-primary-hover)]",
  filterChipOff:
    "bg-[var(--bm-surface-muted)] text-[var(--bm-text-sub)] ring-1 ring-[var(--bm-border)] hover:bg-[var(--bm-surface-blue)]",
  tabBtn:
    "shrink-0 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 ring-1 ring-[var(--bm-border)] bg-[var(--bm-surface-muted)] transition duration-200 motion-safe:hover:bg-white motion-safe:hover:text-[var(--bm-text)]",
  tabBtnActive:
    "shrink-0 whitespace-nowrap rounded-xl bg-[var(--bm-navy)] px-4 py-2.5 text-sm font-bold text-white shadow-[var(--bm-shadow-sm)] ring-1 ring-[var(--bm-navy)]",
  nextStepCard:
    "bm-card-surface group block rounded-[18px] border border-[var(--bm-border)] bg-gradient-to-br from-white to-[var(--bm-surface-muted)] p-3 shadow-[var(--bm-shadow-sm)] transition duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-[var(--bm-primary)]/30 motion-safe:hover:shadow-[var(--bm-shadow-md)]",
  searchInset:
    "rounded-[20px] border border-[var(--bm-border)] bg-[var(--bm-card)] p-1 shadow-[var(--bm-shadow-md)] ring-1 ring-[var(--bm-primary)]/5",

  badge:
    "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold ring-1 sm:text-xs",
  badgeBlue: "bg-[var(--bm-info-soft)] text-blue-800 ring-[var(--bm-border-blue)]",
  badgeGreen: "bg-[var(--bm-success-soft)] text-emerald-800 ring-emerald-200/80",
  badgeAmber: "bg-[var(--bm-warning-soft)] text-amber-900 ring-amber-200/80",
  badgeCyan: "bg-[var(--bm-indigo-soft)] text-indigo-800 ring-indigo-200/80",
  badgeIndigo: "bg-[var(--bm-indigo-soft)] text-indigo-800 ring-indigo-200/80",
  badgeRed: "bg-[var(--bm-danger-bg)] text-red-800 ring-red-200/80",
  badgeGray: "bg-[var(--bm-surface-muted)] text-[var(--bm-text-sub)] ring-[var(--bm-border)]",
  badgeNavy: "bg-[var(--bm-surface-blue)] text-[var(--bm-primary-dark)] ring-[var(--bm-border-blue)]",

  /** fitment 판정 배지 */
  statusRecommended: "bg-[var(--bm-info-soft)] text-blue-800 ring-[var(--bm-border-blue)]",
  statusOk: "bg-[var(--bm-success-soft)] text-emerald-800 ring-emerald-200/80",
  statusSubstitute: "bg-[var(--bm-indigo-soft)] text-indigo-800 ring-indigo-200/80",
  statusCheck: "bg-[var(--bm-warning-soft)] text-amber-900 ring-amber-200/80",
  statusWarn: "bg-[var(--bm-danger-bg)] text-red-800 ring-red-200/80",

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
    "rounded-[22px] border border-[var(--bm-border)] bg-[var(--bm-surface-soft)] p-4 shadow-[var(--bm-shadow-sm)] sm:p-5",

  input:
    "h-11 w-full rounded-xl border border-[var(--bm-border)] bg-[var(--bm-surface-muted)] px-3 text-base font-semibold text-[var(--bm-text)] outline-none transition focus:border-[var(--bm-primary)] focus:bg-white focus:ring-2 focus:ring-blue-100/80 sm:text-sm",

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
