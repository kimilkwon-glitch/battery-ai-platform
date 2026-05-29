import Link from "next/link";
import { BatteryCardImage } from "@/components/media/BatteryCardImage";
import { bm } from "@/lib/design-tokens";
import type { HomeCatalogProduct } from "@/lib/home-main-catalog-data";
import { HOME_SPEC_CARD_ACTIONS } from "@/lib/home-main-catalog-data";

type Props = {
  product: HomeCatalogProduct;
};

export function HomeSpecExploreCard({ product }: Props) {
  const { code, typeTag, summary } = product;

  return (
    <article
      className={`${bm.card} flex flex-col overflow-hidden transition duration-200 motion-safe:hover:shadow-[var(--bm-shadow-md)]`}
      data-home-spec-card={code}
    >
      <div className="border-b border-[var(--bm-border)] bg-[var(--bm-surface-soft)] p-3">
        <BatteryCardImage code={code} flushTop layout="stack" variant="card" className="mx-auto max-h-[140px] w-full" />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="spec-code text-lg font-black tracking-tight text-slate-900">{code}</p>
          <span className={`${bm.badge} ${bm.badgeBlue}`}>{typeTag}</span>
        </div>
        <p className="mt-2 line-clamp-2 text-xs font-medium leading-relaxed text-slate-600">{summary}</p>
        <div className="mt-4">
          <Link
            className={`${bm.btnNavy} inline-flex w-full items-center justify-center text-sm`}
            href={HOME_SPEC_CARD_ACTIONS.fitCheck(code)}
          >
            내 차에 맞는지 확인
          </Link>
        </div>
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 border-t border-slate-100 pt-3 text-[10px] font-bold text-slate-500">
          <Link className="hover:text-blue-700 hover:underline" href={HOME_SPEC_CARD_ACTIONS.photo}>
            사진 확인
          </Link>
          <Link className="hover:text-blue-700 hover:underline" href={HOME_SPEC_CARD_ACTIONS.outbound}>
            출장교체
          </Link>
          <Link className="hover:text-blue-700 hover:underline" href={HOME_SPEC_CARD_ACTIONS.store}>
            매장방문
          </Link>
          <Link className="hover:text-blue-700 hover:underline" href={HOME_SPEC_CARD_ACTIONS.delivery}>
            택배주문
          </Link>
        </div>
      </div>
    </article>
  );
}
