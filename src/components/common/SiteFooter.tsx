import { BRAND_FOOTER, BRAND_NAME } from "@/lib/brand";
import {
  HUB_BATTERY,
  HUB_PHOTO,
  HUB_QA,
  HUB_SHOP,
  HUB_STORE,
  HUB_VEHICLES,
} from "@/lib/customer-hub-routes";
import { bm } from "@/lib/design-tokens";
import { BUILD_STAMP } from "@/lib/build-stamp";

const links = [
  ["차종검색", HUB_VEHICLES],
  ["배터리 규격", HUB_BATTERY],
  ["사진확인", HUB_PHOTO],
  ["매장·출장", HUB_STORE],
  ["택배·쇼핑", HUB_SHOP],
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
