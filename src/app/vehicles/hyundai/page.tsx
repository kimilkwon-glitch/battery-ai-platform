import Link from "next/link";
import { ModelHubCard } from "@/components/car/ModelHubCard";
import { PortalLayout } from "@/components/portal";
import { getHyundaiModelHubs } from "@/lib/car-data";

export default function HyundaiVehiclesPage() {
  const models = getHyundaiModelHubs();

  return (
    <PortalLayout
      showSearch
      title="현대 차종"
      description="모델별 세대·연료·AGM/DIN 배터리 규격 — 그랜저부터 확장"
      breadcrumbs={[{ label: "홈", href: "/" }, { label: "차종 검색", href: "/vehicles" }, { label: "현대" }]}
      sidebar={
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-sm">
          <p className="font-black text-slate-900">세대별 안내</p>
          <p className="mt-2 font-semibold text-slate-500">쏘나타 · 아반떼 · 싼타페 · 투싼 세대 허브</p>
        </div>
      }
    >
      <div className="mb-4 rounded-xl border border-blue-100 bg-gradient-to-r from-slate-950 to-blue-900 p-4 text-white shadow-sm">
        <p className="text-[10px] font-black text-cyan-200">HYUNDAI · BATTERY PLATFORM</p>
        <h2 className="mt-1 text-lg font-black tracking-[-0.03em]">세대별 차량 · 배터리 규격 안내</h2>
        <p className="mt-1 text-xs font-semibold text-slate-300">연식·연료별로 맞는 배터리 규격을 확인하세요.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {models.map((m) => (
          <ModelHubCard key={m.modelKey} model={m} />
        ))}
      </div>
      <p className="mt-4 text-center">
        <Link href="/vehicles" className="text-xs font-black text-blue-600 hover:underline">
          ← 전체 차종 목록
        </Link>
      </p>
    </PortalLayout>
  );
}
