import { BRAND_FOOTER, BRAND_NAME } from "@/lib/brand";
import {
  HUB_BRANDS,
  HUB_GUIDE,
  HUB_PHOTO,
  HUB_REVIEWS,
  HUB_STORE_DETAIL,
  HUB_SUPPORT,
} from "@/lib/customer-hub-routes";
import { CUSTOMER_CENTER_USED_BATTERY } from "@/lib/customer-center-routes";
import { bm } from "@/lib/design-tokens";
import { OfficialChannelsStrip } from "@/components/common/OfficialChannelsStrip";
import { BUILD_STAMP } from "@/lib/build-stamp";

const links = [
  ["고객센터", HUB_SUPPORT],
  ["폐전지 반납", CUSTOMER_CENTER_USED_BATTERY],
  ["브랜드 안내", HUB_BRANDS],
  ["매장·출장 안내", HUB_STORE_DETAIL],
  ["배터리 가이드", HUB_GUIDE],
  ["리뷰", HUB_REVIEWS],
  ["차종검색", "/vehicles"],
  ["사진확인", HUB_PHOTO],
] as const;

export function SiteFooter({ className = "" }: { className?: string }) {
  return (
    <footer className={`${bm.card} ${bm.cardPad} text-[11px] font-semibold text-slate-500 ${className}`}>
      <p>
        {BRAND_FOOTER}
        <span className="mx-1 text-slate-300">·</span>
        <span className="text-slate-400">배터리매니저</span>
      </p>
      <nav className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
        {links.map(([label, href]) => (
          <a key={href} href={href} className="font-black text-[var(--bm-primary)] hover:underline">
            {label}
          </a>
        ))}
      </nav>
      <OfficialChannelsStrip variant="footer" className="mt-4" />
      <p className="mt-3 text-[10px] text-slate-400">
        © {new Date().getFullYear()} {BRAND_NAME}
        {process.env.NODE_ENV !== "production" ? (
          <>
            <span className="mx-1 text-slate-300">·</span>
            <span className="font-mono" data-build-version={BUILD_STAMP}>
              v {BUILD_STAMP}
            </span>
          </>
        ) : (
          <span className="sr-only" data-build-version={BUILD_STAMP} aria-hidden>
            {BUILD_STAMP}
          </span>
        )}
      </p>
    </footer>
  );
}
