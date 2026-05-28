import Link from "next/link";
import { AppIcon } from "@/components/common/AppIcon";
import { bm } from "@/lib/design-tokens";
import { isPrimaryCtaLabel, isSecondaryCtaLabel } from "@/lib/battery-cta";
import { resolveIconKeyFromCtaLabel } from "@/lib/icon-map";

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

  const renderCta = (cta: { label: string; href: string }, className: string, invert?: boolean) => {
    const iconKey = resolveIconKeyFromCtaLabel(cta.label);
    return (
      <Link key={cta.label} className={`${className} items-center gap-1.5`} href={cta.href}>
        {iconKey ? (
          <AppIcon
            iconKey={iconKey}
            size="sm"
            className={invert ? "!text-white" : undefined}
          />
        ) : null}
        {cta.label}
      </Link>
    );
  };

  return (
    <div>
      {(primary.length > 0 || secondary.length > 0) && (
        <div className={`flex flex-wrap ${compact ? "gap-1.5" : "gap-2"}`}>
          {primary.map((cta) => renderCta(cta, btnPrimary, true))}
          {secondary.map((cta) => renderCta(cta, btnSecondary))}
        </div>
      )}
      {text.length > 0 ? (
        <div className={`flex flex-wrap gap-x-3 ${compact ? "mt-1.5 gap-y-0.5" : "mt-2 gap-y-1"}`}>
          {text.map((link) => renderCta(link, btnText))}
        </div>
      ) : null}
    </div>
  );
}
