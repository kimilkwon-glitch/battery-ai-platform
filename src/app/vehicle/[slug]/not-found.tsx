import Link from "next/link";
import { PortalHeader } from "@/components/portal";
import { bm } from "@/lib/design-tokens";
import { HUB_STORE_DETAIL } from "@/lib/customer-hub-routes";

export default function VehicleNotFound() {
  return (
    <main className={bm.pageBg}>
      <PortalHeader />
      <section className={`${bm.pageContainerWide} mx-auto max-w-lg px-4 py-16 text-center`}>
        <h1 className="text-xl font-black text-slate-950">차량 정보를 찾지 못했습니다</h1>
        <p className="mt-2 text-sm font-medium text-slate-600">
          차종검색에서 다시 선택하거나 상담을 통해 규격을 확인해 주세요.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href="/vehicles" className={`${bm.btnPrimary} text-sm font-black`}>
            차종검색으로 이동
          </Link>
          <Link href={HUB_STORE_DETAIL} className={`${bm.btnSecondary} text-sm font-black`}>
            상담하기
          </Link>
        </div>
      </section>
    </main>
  );
}
