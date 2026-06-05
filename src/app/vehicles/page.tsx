import { Suspense } from "react";
import { PortalLayout } from "@/components/portal";
import { VehiclesBrowseClient } from "@/components/platform/VehiclesBrowseClient";

export default function VehiclesPage() {
  return (
    <PortalLayout
      title="차종검색"
      description="제조사별 차량을 빠르게 찾고, 연식·연료별 배터리 규격을 확인할 수 있습니다"
      breadcrumbs={[{ label: "홈", href: "/" }, { label: "차종검색" }]}
      sidebar={
        <section className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold leading-relaxed text-slate-600 shadow-sm">
          <p className="font-black text-slate-900">교체 전 확인</p>
          <ul className="mt-2 space-y-1.5">
            <li>ISG·스마트충전 → AGM 유지 권장</li>
            <li>용량업은 공간·단자 확인</li>
          </ul>
        </section>
      }
    >
      <Suspense fallback={null}>
        <VehiclesBrowseClient />
      </Suspense>
    </PortalLayout>
  );
}
