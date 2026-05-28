import Link from "next/link";
import { AppIcon } from "@/components/common/AppIcon";
import { bm } from "@/lib/design-tokens";
import type { SearchUxCta } from "@/lib/search/search-ux-presentation";

const PHOTO_HINTS = [
  "현재 장착 배터리 사진 확인",
  "단자 방향이 애매하면 사진으로 확인",
] as const;

export function SearchPhotoVerifyBar({ cta, hintIndex = 0 }: { cta: SearchUxCta; hintIndex?: number }) {
  const hint = PHOTO_HINTS[hintIndex % PHOTO_HINTS.length];
  return (
    <div
      className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-white px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
      data-search-photo-verify
    >
      <p className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
        <AppIcon iconKey="photoCheck" size="sm" />
        {hint}
      </p>
      <Link className={`${bm.btnGhost} inline-flex shrink-0 items-center gap-1.5`} href={cta.href}>
        <AppIcon iconKey="photoCheck" size="sm" />
        {cta.label}
      </Link>
    </div>
  );
}
