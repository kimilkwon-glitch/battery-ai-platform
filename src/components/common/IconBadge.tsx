import { AppIcon } from "@/components/common/AppIcon";
import {
  getIconDef,
  ICON_TONE_PILL,
  type IconKey,
  type IconSize,
  type IconTone,
} from "@/lib/icon-map";

type Props = {
  iconKey: IconKey;
  size?: IconSize;
  tone?: IconTone;
  /** 카드 대표 — pill 크기 확대 */
  large?: boolean;
  className?: string;
  preferTabler?: boolean;
};

export function IconBadge({
  iconKey,
  size = "sm",
  tone,
  large = false,
  className = "",
  preferTabler = false,
}: Props) {
  const def = getIconDef(iconKey);
  const pill = ICON_TONE_PILL[tone ?? def.tone];
  const largeClass = large ? "!h-12 !w-12" : "";

  return (
    <span className={`${pill} shrink-0 ${largeClass} ${className}`} aria-hidden>
      <AppIcon iconKey={iconKey} size={large ? "xl" : size} tone={tone} preferTabler={preferTabler} />
    </span>
  );
}
