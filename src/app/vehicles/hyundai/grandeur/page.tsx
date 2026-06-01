import Link from "next/link";
import { GenerationCard } from "@/components/car/GenerationCard";
import { PortalLayout, PortalPanel } from "@/components/portal";
import { getCarGenerations, getHyundaiGrandeurHub } from "@/lib/car-data";

export default function GrandeurHubPage() {
  const hub = getHyundaiGrandeurHub();
  const generations = getCarGenerations("grandeur", "hyundai");

  return (
    <PortalLayout
      defaultQuery="그랜저 AGM80L"
      title={`${hub.brandDisplayName} ${hub.displayName}`}
      description="TG · HG · IG · 더 뉴 IG · 디 올 뉴 — 세대별 AGM/DIN·연료별 배터리 규격"
      breadcrumbs={[
        { label: "홈", href: "/" },
        { label: "차종 검색", href: "/vehicles" },
        { label: "현대", href: "/vehicles/hyundai" },
        { label: hub.displayName },
      ]}
      sidebar={
        <PortalPanel title="세대 선택 가이드">
          <p className="text-xs font-semibold leading-relaxed text-slate-600">
            연식·트림에 맞는 세대 카드를 선택하세요. ISG·스마트충전 트림은 AGM 비율이 높습니다.
          </p>
          <Link href="/guide/spec?guide=agm-vs-din" className="mt-3 inline-block text-[11px] font-black text-blue-600 hover:underline">
            AGM vs DIN 가이드 →
          </Link>
        </PortalPanel>
      }
    >
      <div className="mb-5 overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a0a0c] via-slate-900 to-blue-950 p-5 text-white shadow-lg ring-1 ring-slate-800">
        <p className="text-[10px] font-black tracking-widest text-cyan-300/90">GRANDEUR GENERATION HUB</p>
        <h2 className="mt-2 text-2xl font-black tracking-[-0.04em]">그랜저 세대별 배터리 안내</h2>
        <p className="mt-2 max-w-2xl text-sm font-semibold text-slate-300">{hub.description}</p>
        <p className="mt-3 text-[11px] font-bold text-slate-400">세대·연식·연료에 따라 규격이 달라질 수 있습니다.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {generations.map((gen) => (
          <GenerationCard key={gen.id} generation={gen} />
        ))}
      </div>
    </PortalLayout>
  );
}
