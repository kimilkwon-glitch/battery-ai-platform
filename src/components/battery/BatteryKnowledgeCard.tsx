import Link from "next/link";
import { bm } from "@/lib/design-tokens";

type Props = {
  title: string;
  summary: string;
  href?: string;
  checkPoints?: string[];
  compact?: boolean;
};

export function BatteryKnowledgeCard({ title, summary, href, checkPoints = [], compact = false }: Props) {
  return (
    <article className={`${bm.card} ${compact ? "p-3" : bm.cardPad}`}>
      <p className={bm.label}>배터리 기본 안내</p>
      <h3 className={`${compact ? "text-sm" : bm.titleMd} mt-1 font-black text-slate-900`}>{title}</h3>
      <p className={`mt-2 ${compact ? "text-xs" : "text-sm"} font-medium leading-relaxed text-slate-600`}>
        {summary}
      </p>
      {checkPoints.length > 0 ? (
        <ul className="mt-2 space-y-1">
          {checkPoints.slice(0, 3).map((p) => (
            <li key={p} className="flex gap-2 text-xs font-medium text-slate-600">
              <span className="font-black text-blue-600">·</span>
              {p}
            </li>
          ))}
        </ul>
      ) : null}
      {href ? (
        <Link className={`${bm.btnTertiary} mt-3 inline-flex text-xs`} href={href}>
          자세히 보기 →
        </Link>
      ) : null}
    </article>
  );
}
