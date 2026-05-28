import { AppIcon } from "@/components/common/AppIcon";
import type { IconKey } from "@/lib/icon-map";
import { bm } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/** 우측 정보 패널 상단 블록 — 제목·설명·badge */
export function CardInfoStack({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn(bm.cardInfoStack, className)}>{children}</div>;
}

/** 제목 행 — 작은 인라인 아이콘 + 제목 (떠 있는 pill 금지) */
export function CardInfoTitleRow({
  title,
  iconKey,
  trailing,
  titleClassName,
}: {
  title: ReactNode;
  iconKey?: IconKey;
  trailing?: ReactNode;
  titleClassName?: string;
}) {
  return (
    <div className={bm.cardInfoTitleRow}>
      {iconKey ? (
        <span className={bm.cardInfoIconBadge} aria-hidden>
          <AppIcon iconKey={iconKey} size="sm" strokeWidth={2.25} />
        </span>
      ) : null}
      <div
        className={cn(
          "min-w-0 flex-1",
          trailing ? "flex items-start justify-between gap-2" : "",
        )}
      >
        {typeof title === "string" ? (
          <h3 className={cn(bm.cardInfoTitle, titleClassName)}>{title}</h3>
        ) : (
          title
        )}
        {trailing}
      </div>
    </div>
  );
}

/** 추천 규격 — badge 또는 강조 텍스트 */
export function CardInfoSpecLine({
  children,
  asBadge = false,
  className,
}: {
  children: ReactNode;
  asBadge?: boolean;
  className?: string;
}) {
  if (asBadge) {
    return (
      <div className={bm.cardInfoBadgeRow}>
        <span className={cn(`${bm.badge} ${bm.badgeBlue}`, className)}>{children}</span>
      </div>
    );
  }
  return (
    <p className={cn(bm.cardInfoSpec, className)} data-spec-code>
      {children}
    </p>
  );
}

/** `·` 구분 규격 문자열 → 파란 badge 행 */
export function CardInfoSpecBadges({ spec }: { spec: string }) {
  const parts = spec
    .split(/[·/]/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length === 0) return null;
  return (
    <CardInfoBadgeRow>
      {parts.map((part) => (
        <span className={`${bm.badge} ${bm.badgeBlue}`} key={part}>
          {part}
        </span>
      ))}
    </CardInfoBadgeRow>
  );
}

export function CardInfoDesc({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <p className={cn(bm.cardInfoDesc, className)}>{children}</p>;
}

export function CardInfoBadgeRow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn(bm.cardInfoBadgeRow, className)}>{children}</div>;
}

export function CardInfoMeta({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <p className={cn(bm.cardInfoMeta, className)}>{children}</p>;
}

/** 하단 CTA·버튼 행 */
export function CardInfoActions({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn(bm.cardInfoActions, className)}>{children}</div>;
}

/** 카드 전체가 Link일 때 compact outline CTA */
export function CardInfoCtaLink({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <span className={cn(bm.cardInfoCtaLink, className)}>{children}</span>;
}
