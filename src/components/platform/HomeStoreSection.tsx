import Link from "next/link";
import { ConversionActions } from "@/components/common/ConversionActions";
import { BUSAN_STORES, BUSAN_CAPABILITIES } from "@/lib/busan-service-hub-data";
import { bm } from "@/lib/design-tokens";

export function HomeStoreSection() {
  return (
    <section className={`${bm.card} p-5`}>
      <p className="text-[11px] font-black uppercase tracking-wide text-blue-600">직영점 · 상담</p>
      <h2 className="mt-1 text-xl font-black text-slate-950">부산 덕천점 · 학장점</h2>
      <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-600">
        북구·사상권을 중심으로 내방·출장 배터리 교체를 운영합니다. 차량·규격 확인 후 문의해 주세요.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {BUSAN_STORES.map((store) => (
          <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200" key={store.id}>
            <p className="text-sm font-black text-slate-900">{store.name}</p>
            <p className="mt-1 text-xs font-semibold text-slate-600">{store.tagline}</p>
            <p className="mt-2 text-[11px] font-medium text-slate-500">{store.areas.slice(0, 4).join(" · ")}…</p>
          </div>
        ))}
      </div>

      <p className="mt-4 text-[11px] font-black text-slate-500">가능 작업</p>
      <p className="mt-1 text-xs font-semibold text-slate-600">{BUSAN_CAPABILITIES.slice(0, 4).join(" · ")} 등</p>

      <ConversionActions
        className="mt-4"
        primary={{ label: "매장·출장 안내", href: "/service-center" }}
        secondary={{ label: "문의하기", href: "/ai" }}
        tertiary={{ label: "Q&A 보기", href: "/community" }}
      />
    </section>
  );
}
