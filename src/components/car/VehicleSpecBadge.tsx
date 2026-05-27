export type VehicleBadgeKind =
  | "agm"
  | "din"
  | "ev"
  | "isg"
  | "bms"
  | "smart"
  | "upgrade"
  | "diff";

export type VehicleBadgeToken =
  | { kind: Exclude<VehicleBadgeKind, "diff"> }
  | { kind: "diff"; level: "easy" | "mid" | "hard" };

const STYLES: Record<Exclude<VehicleBadgeKind, "diff">, string> = {
  agm: "border border-blue-100/80 bg-blue-50/70 text-blue-600/90",
  din: "border border-slate-200/80 bg-slate-50/80 text-slate-600",
  ev: "border border-cyan-100/80 bg-cyan-50/60 text-cyan-700/90",
  isg: "border border-slate-200/70 bg-slate-50/70 text-slate-500",
  bms: "border border-violet-100/70 bg-violet-50/60 text-violet-600/90",
  smart: "border border-amber-100/70 bg-amber-50/60 text-amber-700/90",
  upgrade: "border border-indigo-100/70 bg-indigo-50/60 text-indigo-600/90",
};

const DIFF_STYLES: Record<"easy" | "mid" | "hard", string> = {
  easy: "border border-slate-200/70 bg-slate-50/70 text-slate-500",
  mid: "border border-amber-100/70 bg-amber-50/60 text-amber-700/90",
  hard: "border border-amber-200/60 bg-amber-50/50 text-amber-800/80",
};

const LABELS: Record<Exclude<VehicleBadgeKind, "diff">, string> = {
  agm: "AGM",
  din: "DIN",
  ev: "EV",
  isg: "ISG",
  bms: "BMS",
  smart: "SC",
  upgrade: "UP",
};

const DIFF_LABELS = { easy: "쉬움", mid: "보통", hard: "주의" } as const;

function Icon({ kind }: { kind: VehicleBadgeKind }) {
  const cls = "size-2.5 shrink-0 opacity-85";
  switch (kind) {
    case "agm":
      return (
        <svg viewBox="0 0 16 16" className={cls} aria-hidden>
          <path d="M9 1.5 6 8.5h3.5L7 14.5l7-8.5H10.5L9 1.5Z" fill="currentColor" />
        </svg>
      );
    case "din":
    case "ev":
      return (
        <svg viewBox="0 0 16 16" className={cls} aria-hidden>
          <rect x="2" y="4" width="11" height="8" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <path d="M13 6.5v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );
    case "isg":
      return (
        <svg viewBox="0 0 16 16" className={cls} aria-hidden>
          <path
            d="M11.5 4.5A4.5 4.5 0 1 0 12.8 9M12.8 9V6.5M12.8 9h-2.3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      );
    case "bms":
      return (
        <svg viewBox="0 0 16 16" className={cls} aria-hidden>
          <rect x="2.5" y="2.5" width="11" height="11" rx="2" fill="none" stroke="currentColor" strokeWidth="1.1" />
          <path d="M5.5 8h5M8 5.5v5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
        </svg>
      );
    case "smart":
      return (
        <svg viewBox="0 0 16 16" className={cls} aria-hidden>
          <circle cx="8" cy="8" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.1" />
          <path d="M8 5v3l2 1.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
        </svg>
      );
    case "upgrade":
      return (
        <svg viewBox="0 0 16 16" className={cls} aria-hidden>
          <path d="M8 12V4M8 4 5.5 6.5M8 4l2.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );
    case "diff":
      return (
        <svg viewBox="0 0 16 16" className={cls} aria-hidden>
          <path d="M8 2.5v7M8 11.5h.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

export function VehicleSpecBadge({ token }: { token: VehicleBadgeToken }) {
  const base =
    "inline-flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-[3px] text-[9px] font-semibold tracking-tight";

  if (token.kind === "diff") {
    return (
      <span className={`${base} ${DIFF_STYLES[token.level]}`} title="교체 난이도">
        난이도 : {DIFF_LABELS[token.level]}
      </span>
    );
  }

  return (
    <span
      className={`${base} ${STYLES[token.kind]}`}
      title={token.kind === "smart" ? "스마트충전" : token.kind === "upgrade" ? "용량업 가능" : undefined}
    >
      <Icon kind={token.kind} />
      {LABELS[token.kind]}
    </span>
  );
}
