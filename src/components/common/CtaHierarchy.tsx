import Link from "next/link";
import { bm } from "@/lib/design-tokens";
import { isPrimaryCtaLabel, isSecondaryCtaLabel } from "@/lib/battery-cta";

export function CtaHierarchy({
  ctas,
  links = [],
}: {
  ctas: { label: string; href: string }[];
  links?: { label: string; href: string }[];
}) {
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
        <div className="flex flex-wrap gap-2">
          {primary.map((cta) => (
            <Link key={cta.label} className={`${bm.btnNavy} inline-flex text-xs`} href={cta.href}>
              {cta.label}
            </Link>
          ))}
          {secondary.map((cta) => (
            <Link key={cta.label} className={`${bm.btnSecondary} inline-flex text-xs`} href={cta.href}>
              {cta.label}
            </Link>
          ))}
        </div>
      )}
      {text.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
          {text.map((link) => (
            <Link key={link.label} className={`${bm.btnTertiary} text-[11px]`} href={link.href}>
              {link.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
