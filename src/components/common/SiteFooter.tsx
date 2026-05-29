import { BRAND_FOOTER, BRAND_NAME } from "@/lib/brand";
import {
  HUB_BRANDS,
  HUB_PHOTO,
  HUB_QA,
  HUB_SHOP,
  HUB_STORE_DETAIL,
} from "@/lib/customer-hub-routes";
import { bm } from "@/lib/design-tokens";
import { BUILD_STAMP } from "@/lib/build-stamp";

const links = [
  ["브랜드 안내", HUB_BRANDS],
  ["매장·출장 안내", HUB_STORE_DETAIL],
  ["배터리 업그레이드", "/compare"],
  ["택배주문", HUB_SHOP],
  ["사진확인", HUB_PHOTO],
  ["Q&A", HUB_QA],
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
      <p className="mt-3 text-[10px] text-slate-400">
        © {new Date().getFullYear()} {BRAND_NAME}
        <span className="mx-1 text-slate-300">·</span>
        <span className="font-mono" data-build-version={BUILD_STAMP}>
          v {BUILD_STAMP}
        </span>
      </p>
    </footer>
  );
}
