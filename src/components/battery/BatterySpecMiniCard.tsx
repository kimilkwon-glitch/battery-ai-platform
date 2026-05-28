import Link from "next/link";
import {
  formatDimensions,
  getCustomerBrandSpecs,
  getNormalizedBatterySummary,
  normalizeSpecCode,
  terminalLayoutLabel,
} from "@/data/battery/batterySpecIndex";
import { terminalTypeLabel } from "@/data/battery/spec-helpers";
import { bm } from "@/lib/design-tokens";

type Props = {
  code: string;
  compact?: boolean;
  detailHref?: string;
};

/** 검색·차량 상세용 — 대표 제원 요약 (브랜드 표 없음) */
export function BatterySpecMiniCard({ code, compact = false, detailHref }: Props) {
  const norm = normalizeSpecCode(code);
  const summary = getNormalizedBatterySummary(code);
  if (!summary) return null;

  const brands = getCustomerBrandSpecs(code);
  const dims = formatDimensions(summary.dimensionsMm);
  const href = detailHref ?? `/batteries/${encodeURIComponent(norm)}`;

  return (
    <div className={`${bm.surfaceMuted} ${compact ? "p-2.5" : "p-3"}`}>
      <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">대표 제원 요약</p>
      <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
        <div>
          <dt className="font-bold text-slate-400">용량</dt>
          <dd className="font-black text-slate-800">
            {summary.capacityAh20Hr != null ? `${summary.capacityAh20Hr}Ah` : "확인 필요"}
          </dd>
        </div>
        <div>
          <dt className="font-bold text-slate-400">CCA</dt>
          <dd className="font-black text-slate-800">
            {summary.cca != null ? `${summary.cca}A` : "확인 필요"}
          </dd>
        </div>
        {summary.rc != null ? (
          <div>
            <dt className="font-bold text-slate-400">RC</dt>
            <dd className="font-black text-slate-800">{summary.rc}</dd>
          </div>
        ) : (
          <div>
            <dt className="font-bold text-slate-400">RC</dt>
            <dd className="font-medium text-slate-400">확인 필요</dd>
          </div>
        )}
        <div>
          <dt className="font-bold text-slate-400">단자</dt>
          <dd className="font-black text-slate-800">
            {terminalLayoutLabel(summary.terminalLayout)} · {terminalTypeLabel(summary.terminalType)}
          </dd>
        </div>
        {dims ? (
          <div className="col-span-2">
            <dt className="font-bold text-slate-400">크기</dt>
            <dd className="font-semibold text-slate-700">{dims}</dd>
          </div>
        ) : null}
      </dl>
      {brands.length > 1 ? (
        <p className="mt-2 line-clamp-2 text-[10px] font-medium text-slate-500">
          {brands.length}개 브랜드 제원 등록 · CCA·크기 차이는 상세에서 비교
        </p>
      ) : null}
      <Link className={`${bm.btnTertiary} mt-2 inline-flex text-[10px]`} href={href}>
        이 규격 상세 · 브랜드별 비교 →
      </Link>
    </div>
  );
}
