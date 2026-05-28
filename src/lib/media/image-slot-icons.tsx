import { AppIcon } from "@/components/common/AppIcon";
import { resolveImageSlotIconKey } from "@/lib/icon-map";

export function ImageSlotPurposeIcon({
  purpose,
  assetKey,
  className = "size-4",
}: {
  purpose: string;
  assetKey: string;
  className?: string;
}) {
  const { key, preferTabler } = resolveImageSlotIconKey(purpose, assetKey);
  return <AppIcon iconKey={key} className={className} preferTabler={preferTabler} strokeWidth={2} />;
}
