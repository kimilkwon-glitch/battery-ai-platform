import Link from "next/link";
import { bm } from "@/lib/design-tokens";
import type { BUSAN_STORES } from "@/lib/busan-service-hub-data";

type Store = (typeof BUSAN_STORES)[number];

const STORE_PLACEHOLDER: Record<string, string> = {
  deokcheon: "덕천점 매장 안내",
  hakjang: "학장점 서비스 안내",
};

export function ServiceStoreVisualCard({
  store,
  detailHref,
}: {
  store: Store;
  detailHref: string;
}) {
  const placeholder = STORE_PLACEHOLDER[store.id] ?? "매장 안내";

  return (
    <article
      className={`${bm.card} overflow-hidden border border-slate-200`}
      id={`store-${store.id}`}
    >
      <div
        className="flex h-36 items-center justify-center border-b border-dashed border-slate-200 bg-slate-50 sm:h-40"
        aria-label={placeholder}
      >
        <div className="text-center px-4">
          <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">매장 안내</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">{placeholder}</p>
        </div>
      </div>
      <div className={bm.cardPad}>
        <h4 className="text-lg font-black text-slate-950">{store.name}</h4>
        <p className="mt-0.5 text-xs font-semibold text-blue-700">{store.tagline}</p>

        <p className="mt-3 text-[10px] font-black text-slate-400">담당 권역</p>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {store.areas.map((area) => (
            <span
              key={area}
              className="rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-700 ring-1 ring-slate-200"
            >
              {area}
            </span>
          ))}
        </div>

        <p className="mt-3 text-[10px] font-black text-slate-400">대응</p>
        <ul className="mt-1 flex flex-wrap gap-1">
          {store.scenarios.map((s) => (
            <li
              key={s}
              className="rounded-md bg-blue-50/60 px-2 py-0.5 text-[10px] font-semibold text-slate-700"
            >
              {s}
            </li>
          ))}
        </ul>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link className={`${bm.btnPrimary} text-xs`} href="/analysis/photo">
            사진으로 확인
          </Link>
          <Link className={`${bm.btnSecondary} text-xs`} href="/ai">
            문의하기
          </Link>
          <Link className={`${bm.btnTertiary} text-xs`} href={detailHref}>
            {store.name} 안내
          </Link>
        </div>
      </div>
    </article>
  );
}
