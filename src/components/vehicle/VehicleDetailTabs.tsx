"use client";

import Link from "next/link";
import { useState } from "react";
import { AppIcon } from "@/components/common/AppIcon";
import { GuideCard } from "@/components/common/GuideCard";
import { bm } from "@/lib/design-tokens";
import type { IconKey } from "@/lib/icon-map";
import { VehicleBatteryPanel } from "@/components/vehicle/VehicleBatteryPanel";
import type { FuelBatteryGroup, VehicleDbProfile, YearChip } from "@/lib/vehicleBattery";
import type { VehicleDetail } from "@/lib/vehicle-data";
import { getArticlesByVehicleId } from "@/lib/content";

const TABS = [
  { id: "specs", label: "상세 스펙" },
  { id: "caution", label: "교체 주의" },
  { id: "guides", label: "관련 가이드" },
  { id: "qa", label: "Q&A" },
] as const;

type TabId = (typeof TABS)[number]["id"];

type Props = {
  slug: string;
  vehicle: VehicleDetail;
  profile: VehicleDbProfile | null;
  fuelGroups: FuelBatteryGroup[];
  yearChips: YearChip[];
  vehicleTitle: string;
};

const defaultQna = [
  ["AGM 대신 DIN 배터리로 바꿔도 되나요?", "ISG/IBS 차량은 AGM 유지가 안전합니다."],
  ["BMS 등록은 꼭 해야 하나요?", "차종에 따라 충전 제어 오차 방지를 위해 권장됩니다."],
  ["블랙박스 상시전원은 문제 없나요?", "컷오프 12.2V 이상과 대기전류 점검이 필요합니다."],
];

export function VehicleDetailTabs({
  slug,
  vehicle,
  profile,
  fuelGroups,
  yearChips,
  vehicleTitle,
}: Props) {
  const [tab, setTab] = useState<TabId | null>(null);
  const guides = getArticlesByVehicleId(slug);

  return (
    <div className="space-y-4">
      <VehicleBatteryPanel
        embedded
        fuelGroups={fuelGroups}
        profile={profile}
        relatedVehicles={[]}
        slug={slug}
        vehicleTitle={vehicleTitle}
        yearChips={yearChips}
      />

      <div className={`${bm.cardPremium} p-2`}>
        <p className="px-2 pb-2 text-[11px] font-bold text-[var(--bm-muted)]">추가 정보</p>
        <div className="flex gap-1.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(tab === t.id ? null : t.id)}
              className={tab === t.id ? bm.tabBtnActive : bm.tabBtn}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "specs" ? (
        <div className="bm-tab-panel space-y-3">
          <CollapsibleSection defaultOpen={false} title="호환 제품 · 판정표">
            <div className="space-y-2 md:hidden">
              {vehicle.compatibility.map((item) => (
                <div className={`${bm.surfaceMuted} p-3`} key={item.model}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Link
                      className="spec-code text-sm font-black text-[var(--bm-primary)] hover:underline"
                      href={`/batteries/${encodeURIComponent(item.model)}`}
                    >
                      {item.model}
                    </Link>
                    <span className={`${bm.badge} ${bm.badgeGreen}`}>{item.fit}</span>
                  </div>
                  <p className={`mt-1 ${bm.specData}`}>{item.status}</p>
                  <p className={`mt-1 ${bm.textSub} text-xs`}>{item.note}</p>
                </div>
              ))}
            </div>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[640px] border-separate border-spacing-y-2 text-left text-xs">
                <thead className="text-slate-400">
                  <tr>
                    {["규격", "판정", "상태", "설명"].map((h) => (
                      <th className="px-3 py-1 font-black" key={h}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {vehicle.compatibility.map((item) => (
                    <tr className="bg-slate-50 ring-1 ring-slate-200" key={item.model}>
                      <td className="rounded-l-xl px-3 py-3 font-black text-[var(--bm-primary)]">
                        <Link className="hover:underline" href={`/batteries/${encodeURIComponent(item.model)}`}>
                          {item.model}
                        </Link>
                      </td>
                      <td className="px-3 py-3 font-black text-emerald-600">{item.fit}</td>
                      <td className="px-3 py-3 font-bold text-slate-600">{item.status}</td>
                      <td className="rounded-r-xl px-3 py-3 font-semibold text-slate-500">{item.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CollapsibleSection>
        </div>
      ) : null}

      {tab === "caution" ? (
        <div className="bm-tab-panel space-y-3">
          <PanelBlock title="교체 주의사항">
            <div className="grid gap-2">
              {[
                ["교체 난이도", vehicle.manufacturer === "BMW" ? "상" : "중"],
                ["주의사항", vehicle.bms],
                ["스마트충전", `${vehicle.isg} / IBS 센서 확인`],
              ].map(([label, value]) => (
                <InfoRow key={label} label={label} value={value} />
              ))}
            </div>
          </PanelBlock>

          <CollapsibleSection defaultOpen={false} title="업그레이드 가능성">
            <div className="grid gap-2">
              {vehicle.upgrades.map((item) => (
                <div className={`rounded-xl bg-slate-50 p-3 text-xs font-black text-slate-700 ring-1 ring-slate-200`} key={item}>
                  {item}
                </div>
              ))}
            </div>
          </CollapsibleSection>

          <CollapsibleSection defaultOpen={false} title="증상별 확인">
            <div className="space-y-2">
              {vehicle.diagnosis.map((item) => (
                <Link
                  className={`block ${bm.cardPad} rounded-xl bg-slate-900 text-white`}
                  href={`/diagnosis/${item.title.includes("시동") ? "slow-engine-start" : "winter-discharge"}`}
                  key={item.title}
                >
                  <p className="text-xs font-black text-cyan-200">
                    {item.title} · {item.risk}
                  </p>
                  <p className="mt-1 text-xs font-semibold leading-5 text-slate-400">{item.detail}</p>
                </Link>
              ))}
            </div>
          </CollapsibleSection>
        </div>
      ) : null}

      {tab === "guides" ? (
        guides.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {guides.map((g) => (
              <GuideCard article={g} key={g.id} />
            ))}
          </div>
        ) : (
          <p className={`${bm.card} ${bm.cardPad} text-sm font-semibold text-slate-500`}>등록된 가이드가 없습니다.</p>
        )
      ) : null}

      {tab === "qa" ? (
        <div className="bm-tab-panel">
          <PanelBlock title="자주 묻는 질문">
            <div className="space-y-2">
              {defaultQna.map(([question, answer]) => (
                <Link
                  className={`block ${bm.cardInteractive} ${bm.cardPad}`}
                  href={`/qa?q=${encodeURIComponent(`${vehicle.model} ${question}`)}`}
                  key={question}
                >
                  <p className="text-xs font-black text-[var(--bm-text)]">{question}</p>
                  <p className={`mt-1 ${bm.textSub} text-[11px]`}>{answer}</p>
                </Link>
              ))}
            </div>
          </PanelBlock>
        </div>
      ) : null}
    </div>
  );
}

function PanelBlock({
  title,
  children,
  iconKey,
}: {
  title: string;
  children: React.ReactNode;
  iconKey?: IconKey;
}) {
  return (
    <section className={`${bm.cardPremium} ${bm.cardPad}`}>
      <h3 className={`${bm.cardTitle} mb-3 flex items-center gap-2`}>
        {iconKey ? <AppIcon iconKey={iconKey} size="sm" /> : null}
        <span>{title}</span>
      </h3>
      {children}
    </section>
  );
}

function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className={bm.card}>
      <button
        className="flex w-full items-center justify-between px-4 py-3 text-left"
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        <span className="text-sm font-black text-slate-950">{title}</span>
        <span className="text-xs font-black text-[var(--bm-primary)]">{open ? "접기" : "펼치기"}</span>
      </button>
      {open ? <div className="border-t border-slate-100 px-4 pb-4 pt-3">{children}</div> : null}
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className={`${bm.surfaceMuted} flex items-center justify-between gap-2 px-3 py-2 text-xs`}>
      <span className="font-black text-slate-400">{label}</span>
      <span className="text-right font-black text-slate-700">{value}</span>
    </div>
  );
}
