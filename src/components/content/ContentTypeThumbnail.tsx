import type { AdminContentThumbnailType } from "@/data/admin/adminContent.schema";
import { ADMIN_CONTENT_THUMBNAIL_LABELS } from "@/data/admin/adminContent.schema";
import { bm } from "@/lib/design-tokens";

type Props = {
  thumbnailType: AdminContentThumbnailType;
  title?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZE = {
  sm: "h-12 w-12",
  md: "h-16 w-16",
  lg: "h-20 w-full max-w-[120px]",
} as const;

const TONE: Record<
  AdminContentThumbnailType,
  { wrap: string; icon: string; label: string }
> = {
  guide: { wrap: "bg-blue-50 ring-blue-100", icon: "text-blue-600", label: "text-blue-700" },
  qa: { wrap: "bg-violet-50 ring-violet-100", icon: "text-violet-600", label: "text-violet-700" },
  symptom: { wrap: "bg-rose-50 ring-rose-100", icon: "text-rose-600", label: "text-rose-700" },
  photo_analysis: { wrap: "bg-cyan-50 ring-cyan-100", icon: "text-cyan-700", label: "text-cyan-800" },
  caution: { wrap: "bg-amber-50 ring-amber-100", icon: "text-amber-700", label: "text-amber-800" },
  compare: { wrap: "bg-indigo-50 ring-indigo-100", icon: "text-indigo-600", label: "text-indigo-700" },
  spec_inquiry: { wrap: "bg-slate-100 ring-slate-200", icon: "text-slate-600", label: "text-slate-700" },
  shopping: { wrap: "bg-emerald-50 ring-emerald-100", icon: "text-emerald-700", label: "text-emerald-800" },
  brand: { wrap: "bg-sky-50 ring-sky-100", icon: "text-sky-700", label: "text-sky-800" },
  default: { wrap: "bg-slate-50 ring-slate-200", icon: "text-slate-500", label: "text-slate-600" },
};

function ThumbnailIcon({ type }: { type: AdminContentThumbnailType }) {
  const common = "size-6";
  switch (type) {
    case "qa":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M7 9h6M7 13h4M6 4h12a2 2 0 012 2v9l-3-2H6a2 2 0 01-2-2V6a2 2 0 012-2z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "symptom":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M12 9v4M12 17h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path
            d="M10.3 4.5h3.4L20 19H4L10.3 4.5z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "photo_analysis":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M4 8a2 2 0 012-2h8l4 4v8a2 2 0 01-2 2H6a2 2 0 01-2-2V8z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <circle cx="10" cy="11" r="1.5" fill="currentColor" />
          <path d="M4 16l4-3 3 2 3-4 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "caution":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M12 8v5M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path
            d="M10.5 3.5h3L21 20H3L10.5 3.5z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "compare":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M8 7h8M8 12h8M8 17h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M4 4v16M20 4v16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "spec_inquiry":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="5" y="8" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M9 8V6h6v2M12 12v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "shopping":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M6 6h15l-1.5 9H8L6 6zM9 20a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "brand":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 3l2.2 4.5L19 8.5l-3.5 3.4.8 4.9L12 14.8 7.7 16.8l.8-4.9L5 8.5l4.8-1L12 3z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "guide":
    default:
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M8 4h8a2 2 0 012 2v14l-4-2-4 2-4-2V6a2 2 0 012-2z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M10 8h4M10 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
  }
}

export function ContentTypeThumbnail({ thumbnailType, title, size = "md", className = "" }: Props) {
  const tone = TONE[thumbnailType] ?? TONE.default;
  const label = ADMIN_CONTENT_THUMBNAIL_LABELS[thumbnailType] ?? ADMIN_CONTENT_THUMBNAIL_LABELS.default;

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl ring-1 ${tone.wrap} ${SIZE[size]} ${className}`}
      title={title}
    >
      <div className={tone.icon}>
        <ThumbnailIcon type={thumbnailType} />
      </div>
      {size !== "sm" ? (
        <p className={`mt-1 text-[9px] font-black ${tone.label}`}>{label}</p>
      ) : null}
    </div>
  );
}

export function ContentTypeThumbnailRow({
  thumbnailType,
  title,
  subtitle,
}: {
  thumbnailType: AdminContentThumbnailType;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className={`${bm.card} flex items-center gap-3 p-3`}>
      <ContentTypeThumbnail thumbnailType={thumbnailType} size="sm" />
      <div className="min-w-0">
        <p className="truncate text-xs font-black text-slate-900">{title}</p>
        {subtitle ? <p className="truncate text-[10px] font-semibold text-slate-500">{subtitle}</p> : null}
      </div>
    </div>
  );
}
