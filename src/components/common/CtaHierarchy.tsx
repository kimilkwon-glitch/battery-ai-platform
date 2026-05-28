import Link from "next/link";
import { bm } from "@/lib/design-tokens";
import { isPrimaryCtaLabel, isSecondaryCtaLabel } from "@/lib/battery-cta";

export function CtaHierarchy({
  ctas,
  links = [],
  compact = false,
}: {
  ctas: { label: string; href: string }[];
  links?: { label: string; href: string }[];
  /** 배터리 상품 카드 하단 — 버튼 높이·패딩 축소 */
  compact?: boolean;
}) {
  const btnPrimary = compact ? bm.btnCardNavy : `${bm.btnNavy} inline-flex text-xs`;
  const btnSecondary = compact ? bm.btnCardSecondary : `${bm.btnSecondary} inline-flex text-xs`;
  const btnText = compact ? `${bm.btnTertiary} text-[10px]` : `${bm.btnTertiary} text-[11px]`;
  const seen = new Set<string>();
  const primary: { label: string; href: string }[] = [];
  const secondary: { label: string; href: string }[] = [];
  const text: { label: string; href: string }[] = [];

  const add = (list: typeof primary, cta: { label: string; href: string }) => {
    if (seen.has(cta.label)) return;
    seen.add(cta.label);
    list.push(cta);
  };

  for (const cta of ctas) {
    if (isPrimaryCtaLabel(cta.label) && primary.length < 1) add(primary, cta);
  }
  for (const cta of ctas) {
    if (isSecondaryCtaLabel(cta.label) && secondary.length < 2) add(secondary, cta);
  }
  for (const cta of [...ctas, ...links]) {
    if (!isPrimaryCtaLabel(cta.label) && !isSecondaryCtaLabel(cta.label)) add(text, cta);
  }

  return (
    <div>
      {(primary.length > 0 || secondary.length > 0) && (
        <div className={`flex flex-wrap ${compact ? "gap-1.5" : "gap-2"}`}>
          {primary.map((cta) => (
            <Link key={cta.label} className={btnPrimary} href={cta.href}>
              {cta.label}
            </Link>
          ))}
          {secondary.map((cta) => (
            <Link key={cta.label} className={btnSecondary} href={cta.href}>
              {cta.label}
            </Link>
          ))}
        </div>
      )}
      {text.length > 0 ? (
        <div className={`flex flex-wrap gap-x-3 ${compact ? "mt-1.5 gap-y-0.5" : "mt-2 gap-y-1"}`}>
          {text.map((link) => (
            <Link key={link.label} className={btnText} href={link.href}>
              {link.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
