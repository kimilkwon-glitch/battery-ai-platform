import Link from "next/link";
import type { inquiryNextActions } from "@/lib/inquiry-hub-data";

type Action = (typeof inquiryNextActions)[number];

function ActionIcon({ kind }: { kind: Action["icon"] }) {
  const cls = "size-5 text-blue-600";
  switch (kind) {
    case "vehicle":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M4 14h16l-1.5-5H5.5L4 14z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <circle cx="7.5" cy="16.5" r="1.5" fill="currentColor" />
          <circle cx="16.5" cy="16.5" r="1.5" fill="currentColor" />
        </svg>
      );
    case "battery":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="5" y="8" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
          <path d="M8 8V6a4 4 0 018 0v2M12 12h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "camera":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="4" y="7" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="11" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.8" />
          <path d="M17 10h2a1 1 0 011 1v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "symptom":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M12 9v4M12 17h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path
            d="M10.3 4.5h3.4L19 12l-5.3 7.5h-3.4L5 12l5.3-7.5z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}

export function InquiryNextActions({ actions }: { actions: readonly Action[] }) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:shadow-md"
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-blue-50 ring-1 ring-blue-100">
            <ActionIcon kind={action.icon} />
          </span>
          <p className="mt-3 text-sm font-black text-slate-900">{action.title}</p>
          <p className="mt-1 flex-1 text-xs font-medium leading-relaxed text-slate-500">{action.description}</p>
          <span className="mt-3 text-xs font-bold text-blue-600">안내 보기 →</span>
        </Link>
      ))}
    </section>
  );
}
