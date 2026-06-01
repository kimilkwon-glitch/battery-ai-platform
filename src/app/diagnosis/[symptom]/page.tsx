import Link from "next/link";
import { Breadcrumb, PortalHeader, PortalPanel, StatusBadge } from "@/components/portal";
import { BatteryMiniThumb } from "@/components/BatteryThumbnail";
import { ContentCoverImage } from "@/components/content/ContentCoverImage";
import { SmartNextActions } from "@/components/common/SmartNextActions";
import { SectionHeader } from "@/components/common/SectionHeader";
import { bm } from "@/lib/design-tokens";
import { resolveBatteryImageSetForCode } from "@/lib/batteryImages";
import { buildContextFromSymptom } from "@/lib/navigationGraph";
import {
  getDiagnosisCategories,
  getDiagnosisDetail,
  getDiagnosisSlugs,
} from "@/lib/diagnosis-data";

export function generateStaticParams() {
  return getDiagnosisSlugs().map((symptom) => ({ symptom }));
}

export default async function DiagnosisDetailPage({ params }: { params: Promise<{ symptom: string }> }) {
  const { symptom } = await params;
  const diagnosis = getDiagnosisDetail(symptom);
  const categories = getDiagnosisCategories();
  const related = categories.filter((category) => diagnosis.related.includes(category.slug));

  const verdict =
    diagnosis.analysis[0]?.title && diagnosis.actions[0]?.title
      ? `${diagnosis.title} 증상은 ${diagnosis.analysis[0].title} 가능성이 높습니다. ${diagnosis.actions[0].title}부터 확인하세요.`
      : diagnosis.summary;

  return (
    <main className={bm.pageBg}>
      <PortalHeader title="증상 확인" />
      <section className={`${bm.pageContainer} pt-4`}>
        <Breadcrumb items={[{ label: "홈", href: "/" }, { label: "증상 확인", href: "/diagnosis" }, { label: diagnosis.title }]} />

        <header className={`${bm.heroPanel} mb-4 overflow-hidden ${bm.cardPad} p-0`}>
          <ContentCoverImage
            contentId={`symptom-${symptom}`}
            objectFit="cover"
            roundedClass="rounded-none"
            showTitle
            title={diagnosis.title}
            variant="hero"
          />
          <div className="p-4">
          <p className={bm.label}>증상 확인 결과</p>
          <h1 className="mt-1 text-xl font-black text-slate-950">{diagnosis.title}</h1>
          <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-700">{verdict}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {diagnosis.tags.map((tag) => (
              <StatusBadge key={tag} tone="gray">
                {tag}
              </StatusBadge>
            ))}
          </div>
          </div>
        </header>

        <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
          <section className="space-y-4">
            <PortalPanel title="확인할 점">
              <div className="grid gap-2 sm:grid-cols-2">
                {diagnosis.signals.map(([label, value, detail]) => (
                  <div className="rounded-lg bg-slate-50 p-3 ring-1 ring-slate-200" key={label}>
                    <p className="text-[10px] font-black text-slate-400">{label}</p>
                    <p className="mt-0.5 text-sm font-black text-slate-900">{value}</p>
                    <p className="mt-1 text-[11px] font-semibold text-slate-500">{detail}</p>
                  </div>
                ))}
              </div>
            </PortalPanel>

            <PortalPanel title="가능성 높은 원인">
              <div className="grid gap-2 md:grid-cols-2">
                {diagnosis.analysis.map((item) => (
                  <article className={`${bm.cardPad} rounded-lg bg-slate-50 ring-1 ring-slate-200`} key={item.title}>
                    <p className="text-sm font-black text-slate-900">{item.title}</p>
                    <p className="mt-1 text-[11px] font-semibold leading-relaxed text-slate-600">{item.detail}</p>
                  </article>
                ))}
              </div>
            </PortalPanel>

            <PortalPanel title="추천 행동">
              <div className="space-y-2">
                {diagnosis.actions.slice(0, 4).map((action, index) => (
                  <div className="rounded-lg bg-slate-50 p-3 ring-1 ring-slate-200" key={action.title}>
                    <div className="flex items-center gap-2">
                      <span className="flex size-6 items-center justify-center rounded-full bg-[var(--bm-primary)] text-[10px] font-black text-white">
                        {index + 1}
                      </span>
                      <span className="text-sm font-black text-slate-900">{action.title}</span>
                    </div>
                    <p className="mt-1 pl-8 text-[11px] font-semibold text-slate-500">{action.detail}</p>
                  </div>
                ))}
              </div>
            </PortalPanel>

            <PortalPanel title="관련 배터리 규격">
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {diagnosis.batteries.map((battery) => (
                  <Link
                    className={`${bm.cardInteractive} ${bm.cardPad}`}
                    href={`/batteries/${encodeURIComponent(battery.model)}`}
                    key={battery.model}
                  >
                    <BatteryMiniThumb
                      className="h-14 w-full"
                      code={battery.model}
                      imageSet={resolveBatteryImageSetForCode(battery.model)}
                    />
                    <p className="mt-2 text-sm font-black">{battery.model}</p>
                    <p className="mt-0.5 text-[10px] font-semibold text-slate-500">{battery.note}</p>
                  </Link>
                ))}
              </div>
            </PortalPanel>

            <SmartNextActions context={buildContextFromSymptom(symptom)} limit={5} />

            <PortalPanel title="함께 확인할 증상">
              <div className="grid gap-2 sm:grid-cols-2">
                {related.map((item) => (
                  <Link
                    className={`${bm.cardPad} rounded-lg bg-slate-50 ring-1 ring-slate-200 hover:bg-blue-50`}
                    href={`/diagnosis/${item.slug}`}
                    key={item.slug}
                  >
                    <p className="text-sm font-black">{item.title}</p>
                    <p className="mt-1 line-clamp-2 text-[11px] font-semibold text-slate-500">{item.subtitle}</p>
                  </Link>
                ))}
              </div>
            </PortalPanel>
          </section>

          <aside className="space-y-3 lg:sticky lg:top-[72px] lg:self-start">
            <section className={`${bm.card} ${bm.cardPad}`}>
              <SectionHeader title="빠른 연결" />
              <div className="grid gap-2">
                <Link className={bm.btnPrimary} href="/vehicles">
                  차량별 배터리 확인
                </Link>
                <Link className={bm.btnSecondary} href="/analysis/photo">
                  사진 규격 확인
                </Link>
                <Link className={bm.btnSecondary} href="/guides">
                  관련 가이드
                </Link>
                <Link className={bm.btnSecondary} href="/service-center">
                  작업 가능점
                </Link>
              </div>
            </section>

            <PortalPanel title="관련 증상">
              <div className="space-y-1.5">
                {related.slice(0, 4).map((item) => (
                  <Link
                    className="block rounded-lg bg-slate-50 px-3 py-2 text-xs font-black ring-1 ring-slate-200 hover:bg-blue-50"
                    href={`/diagnosis/${item.slug}`}
                    key={item.slug}
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            </PortalPanel>
          </aside>
        </div>
      </section>
    </main>
  );
}
