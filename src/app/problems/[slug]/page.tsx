import Link from "next/link";
import { PageShell } from "@/components/common/PageShell";
import { PortalPanel } from "@/components/portal";
import { SmartNextActions } from "@/components/common/SmartNextActions";
import { bm } from "@/lib/design-tokens";
import { buildContextFromSymptom } from "@/lib/navigationGraph";

const problemData = {
  "slow-start": {
    title: "시동이 늦게 걸려요",
    category: "시동 문제",
    summary: "시동 지연은 SOH 저하, CCA 부족, 단거리 운행 충전 부족이 겹칠 때 자주 발생합니다.",
    diagnosisHref: "/diagnosis/slow-engine-start",
    symptomId: "slow-engine-start",
    checks: ["전압/OCV 측정", "CCA·SOH 확인", "주행·충전 패턴 점검", "BMS/IBS 등록 확인"],
  },
  "blackbox-drain": {
    title: "블랙박스 때문에 방전돼요",
    category: "방전 원인",
    summary: "주차녹화, 낮은 컷오프, 짧은 주행 패턴이 겹치면 AGM도 반복 방전될 수 있습니다.",
    diagnosisHref: "/diagnosis/blackbox-drain",
    symptomId: "blackbox-drain",
    checks: ["대기전류 측정", "컷오프 전압 확인", "주차녹화 설정 점검", "배터리 SOH 확인"],
  },
  "agm-compatibility": {
    title: "AGM 꼭 써야 하나요?",
    category: "규격 선택",
    summary: "ISG/IBS/BMS 차량은 AGM·EFB 유지가 충전 제어와 수명 안정성에 유리합니다.",
    diagnosisHref: "/diagnosis/agm-replacement",
    symptomId: "agm-replacement",
    checks: ["ISG/IBS 적용 여부", "순정 규격 확인", "BMS 등록 필요성", "AGM/EFB 호환"],
  },
  "winter-discharge": {
    title: "겨울철 방전이 자주 돼요",
    category: "계절 이슈",
    summary: "저온에서 CCA 여유율이 중요해지고 노후 배터리는 시동 지연·경고등이 함께 나타납니다.",
    diagnosisHref: "/diagnosis/winter-discharge",
    symptomId: "winter-discharge",
    checks: ["CCA 여유율 확인", "저온 시동 테스트", "SOH 점검", "충전 상태 확인"],
  },
} as const;

export default async function ProblemDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const problem = problemData[slug as keyof typeof problemData] ?? problemData["slow-start"];

  return (
    <PageShell pageLabel="증상·문제" title={problem.title} description={problem.summary}>
      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          <PortalPanel title="확인 요약" meta={problem.category}>
            <p className="text-sm font-semibold leading-relaxed text-slate-700">{problem.summary}</p>
          </PortalPanel>

          <PortalPanel title="권장 점검 순서">
            <div className="grid gap-2 md:grid-cols-2">
              {problem.checks.map((step, index) => (
                <div className="rounded-lg bg-slate-50 px-3 py-2.5 ring-1 ring-slate-200" key={step}>
                  <span className="text-[10px] font-black text-[var(--bm-primary)]">STEP {index + 1}</span>
                  <p className="mt-0.5 text-sm font-black text-slate-900">{step}</p>
                </div>
              ))}
            </div>
          </PortalPanel>

          <PortalPanel title="호환 배터리">
            <div className="flex flex-wrap gap-2">
              {["AGM80L", "DIN74L", "AGM95L"].map((code) => (
                <Link
                  key={code}
                  className={`${bm.badge} ${bm.badgeBlue} px-3 py-2 text-xs hover:bg-blue-100`}
                  href={`/batteries/${encodeURIComponent(code)}`}
                >
                  {code}
                </Link>
              ))}
            </div>
          </PortalPanel>

          <SmartNextActions context={buildContextFromSymptom(problem.symptomId)} limit={5} />
        </div>

        <aside className="space-y-3 lg:sticky lg:top-[72px] lg:self-start">
          <section className={`${bm.card} ${bm.cardPad}`}>
            <p className="text-sm font-black text-slate-900">다음 단계</p>
            <div className="mt-3 grid gap-2">
              <Link className={bm.btnPrimary} href={problem.diagnosisHref}>
                증상 확인으로 이동
              </Link>
              <Link className={bm.btnSecondary} href={`/community?q=${encodeURIComponent(problem.title)}`}>
                Q&A 검색
              </Link>
              <Link className={bm.btnSecondary} href="/guides">
                가이드 보기
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </PageShell>
  );
}
