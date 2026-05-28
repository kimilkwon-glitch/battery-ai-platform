import { bm } from "@/lib/design-tokens";

const toneMap = {
  blue: bm.badgeBlue,
  green: bm.badgeGreen,
  amber: bm.badgeAmber,
  cyan: bm.badgeCyan,
  red: bm.badgeRed,
  gray: bm.badgeGray,
} as const;

export function BatterySpecBadge({
  children,
  tone = "blue",
}: {
  children: React.ReactNode;
  tone?: keyof typeof toneMap;
}) {
  return <span className={`${bm.badge} ${toneMap[tone]}`}>{children}</span>;
}

export function BrandBadge({ children }: { children: React.ReactNode }) {
  return <span className={`${bm.badge} ${bm.badgeGray}`}>{children}</span>;
}
