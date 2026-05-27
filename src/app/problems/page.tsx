import Link from "next/link";
import { PageShell } from "@/components/common/PageShell";
import { ContentCoverImage } from "@/components/content/ContentCoverImage";
import { VehicleCard, PortalPanel } from "@/components/portal";
import { bm } from "@/lib/design-tokens";

const problems = [
  {
    title: "시동이 늦게 걸려요",
    slug: "slow-start",
    tag: "시동 · CCA",
    summary: "CCA 저하, SOH 감소, 단거리 운행 충전 부족을 확인합니다.",
    href: "/diagnosis/slow-engine-start",
  },
  {
    title: "블랙박스 때문에 방전돼요",
    slug: "blackbox-drain",
    tag: "방전 · 대기전류",
    summary: "대기전류, 컷오프 전압, 주차녹화 패턴을 점검합니다.",
    href: "/diagnosis/blackbox-drain",
  },
  {
    title: "AGM 꼭 써야 하나요?",
    slug: "agm-compatibility",
    tag: "규격 · ISG",
    summary: "ISG/IBS/BMS 차량의 AGM·EFB 유지 필요성을 확인합니다.",
    href: "/diagnosis/agm-replacement",
  },
  {
    title: "겨울철 방전이 자주 돼요",
    slug: "winter-discharge",
    tag: "계절 · CCA",
    summary: "저온 CCA 성능 저하와 교체 시점을 확인합니다.",
    href: "/diagnosis/winter-discharge",
  },
] as const;

const relatedVehicles = [
  ["쏘렌토 MQ4", "2019-2025 · 디젤", "sorento-mq4", "/vehicle/sorento-mq4"],
  ["EV6", "2021-2025 · EV", "ev6", "/vehicle/ev6"],
  ["BMW G30", "2017-2023 · 가솔린", "bmw-g30", "/vehicle/bmw-g30"],
] as const;

export default function ProblemsPage() {
  return (
    <PageShell
      pageLabel="증상·문제"
      title="증상·문제 목록"
      description="증상을 선택하면 원인 확인, 점검 순서, 호환 배터리로 이어집니다. 상세 진단은 증상 확인 페이지에서 진행합니다."
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          <PortalPanel title="증상·문제 카드" meta={`${problems.length}개`}>
            <div className="grid gap-3 md:grid-cols-2">
              {problems.map((item) => {
                const symptomSlug = item.href.replace("/diagnosis/", "");
                return (
                <article key={item.slug} className={`overflow-hidden ${bm.cardInteractive}`}>
                  <ContentCoverImage
                    contentId={`symptom-${symptomSlug}`}
                    objectFit="cover"
                    roundedClass="rounded-none rounded-t-2xl"
                    title={item.title}
                    variant="card"
                  />
                  <div className={bm.cardPad}>
                  <p className="text-[10px] font-black text-[var(--bm-primary)]">{item.tag}</p>
                  <h2 className="mt-1 text-base font-black text-slate-950">{item.title}</h2>
                  <p className="mt-1 text-xs font-semibold text-slate-500">{item.summary}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link className={bm.btnPrimary} href={item.href}>
                      증상 확인
                    </Link>
                    <Link className={bm.btnSecondary} href={`/guides?category=${encodeURIComponent("점검·관리 팁")}`}>
                      가이드
                    </Link>
                    <Link className={bm.btnGhost} href={`/community?q=${encodeURIComponent(item.title)}`}>
                      Q&A
                    </Link>
                  </div>
                  </div>
                </article>
                );
              })}
            </div>
          </PortalPanel>

          <section className={`${bm.warningPanel}`}>
            <p className="text-sm font-black text-slate-800">증상 확인과의 차이</p>
            <p className="mt-1 text-xs font-semibold text-slate-600">
              이 페이지는 증상·문제 목록 허브입니다. 차량 입력 후 결과를 보는 진단 흐름은{" "}
              <Link className="font-black text-[var(--bm-primary)] hover:underline" href="/diagnosis">
                증상 확인
              </Link>
              에서 진행하세요.
            </p>
          </section>
        </div>

        <aside className="space-y-3 lg:sticky lg:top-[72px] lg:self-start">
          <PortalPanel title="관련 차종">
            {relatedVehicles.map(([title, meta, vehicleId, href], index) => (
              <VehicleCard href={href} index={index} title={title} vehicleId={vehicleId} key={title} />
            ))}
          </PortalPanel>
          <PortalPanel title="빠른 메뉴">
            <Link className={`${bm.btnPrimary} mb-2 w-full`} href="/diagnosis">
              증상 확인 시작
            </Link>
            <Link className={`${bm.btnSecondary} w-full`} href="/community">
              규격 문의
            </Link>
          </PortalPanel>
        </aside>
      </div>
    </PageShell>
  );
}
