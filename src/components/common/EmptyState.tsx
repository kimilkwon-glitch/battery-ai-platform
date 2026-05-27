import Link from "next/link";
import { bm } from "@/lib/design-tokens";

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className={`${bm.card} ${bm.cardPad} text-center`}>
      <p className="text-sm font-black text-slate-800">{title}</p>
      {description ? <p className="mt-1 text-xs font-medium text-slate-500">{description}</p> : null}
      {actionLabel && actionHref ? (
        <Link href={actionHref} className={`${bm.btnPrimary} mt-4`}>
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
