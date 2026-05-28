import {
  getIconDef,
  getLucideIcon,
  getTablerIcon,
  ICON_SIZE_CLASS,
  ICON_TONE_TEXT,
  type IconKey,
  type IconSize,
  type IconTone,
} from "@/lib/icon-map";

type Props = {
  iconKey: IconKey;
  size?: IconSize;
  tone?: IconTone;
  className?: string;
  strokeWidth?: number;
  /** Tabler는 차량·사진·정비·출장 특화에만 */
  preferTabler?: boolean;
};

export function AppIcon({
  iconKey,
  size = "md",
  tone,
  className = "",
  strokeWidth = 2,
  preferTabler = false,
}: Props) {
  const def = getIconDef(iconKey);
  const toneClass = ICON_TONE_TEXT[tone ?? def.tone];
  const sizeClass = ICON_SIZE_CLASS[size];
  const Tabler = preferTabler ? getTablerIcon(iconKey) : undefined;

  if (Tabler) {
    return <Tabler className={`${sizeClass} ${toneClass} ${className}`} stroke={strokeWidth} aria-hidden />;
  }

  const Lucide = getLucideIcon(iconKey);
  return (
    <Lucide
      className={`${sizeClass} ${toneClass} ${className}`}
      strokeWidth={strokeWidth}
      aria-hidden
    />
  );
}
