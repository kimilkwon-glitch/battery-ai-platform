import Link from "next/link";
import { UPGRADE_PRINCIPLES, getUpgradeRulesForCode } from "@/data/battery/upgradeRules";
import { bm } from "@/lib/design-tokens";
import { SectionHeader } from "@/components/common/SectionHeader";

type Props = {
  code: string;
  compact?: boolean;
};

export function UpgradeRuleCard({ code, compact = false }: Props) {
  const rules = getUpgradeRulesForCode(code);

  return (
    <section className={`${bm.card} ${compact ? "p-3" : bm.cardPad}`}>
      <SectionHeader
        title="업그레이드·호환 기준"
        description="용량만 키우는 작업이 아닙니다"
        label="교체 상담"
      />
      <p className="mt-2 text-xs font-medium leading-relaxed text-slate-600">
        배터리 업그레이드는 단순히 용량만 키우는 작업이 아닙니다. 단자 방향, 단자 타입, 트레이 여유, 고정쇠,
        충전 시스템이 함께 맞아야 합니다.
      </p>
      <ul className="mt-2 space-y-1">
        {UPGRADE_PRINCIPLES.slice(0, compact ? 3 : 5).map((p) => (
          <li key={p} className="text-xs font-medium text-slate-600">
            · {p}
          </li>
        ))}
      </ul>
      {rules.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {rules.map((r) => (
            <li className={bm.surfaceMuted + " px-3 py-2 text-xs"} key={r.id}>
              <span className="font-black text-slate-800">
                {r.fromCode} → {r.toCode}
              </span>
              <span className="ml-1 font-bold text-slate-500">
                ({r.feasibility === "conditional" ? "조건부" : r.feasibility === "possible" ? "검토" : "비권장"})
              </span>
              <p className="mt-0.5 font-medium text-slate-600">{r.summary}</p>
            </li>
          ))}
        </ul>
      ) : null}
      <Link className={`${bm.btnTertiary} mt-3 inline-flex text-xs`} href="/guides/knowledge/bk-upgrade-conditions">
        업그레이드 조건 자세히 →
      </Link>
    </section>
  );
}
