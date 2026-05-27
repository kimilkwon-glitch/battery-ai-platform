import { PortalHeader } from "@/components/portal";

const guideRows = [
  ["쏘렌토 MQ4 하이브리드 AGM60L", "연료별 규격 확인", "AGM60L · 하이브리드", "차종별 가이드", "/guides/sorento-mq4-hybrid-agm60l"],
  ["포터2 2020년 전후 배터리", "90R vs 100R", "90R · 100R", "규격 가이드", "/guides/porter2-year-battery-guide"],
  ["스타리아 AGM80R 단자", "L/R 방향 확인", "AGM80R", "차종별 가이드", "/guides/staria-agm80r-guide"],
  ["그랜저 IG 연료별 배터리", "가솔린·디젤·LPG", "AGM80L · DIN", "차종별 가이드", "/guides/grandeur-ig-fuel-battery-guide"],
  ["G80 RG3 AGM95R", "제네시스 사진 확인", "AGM95R", "사진 확인 가이드", "/guides/g80-rg3-agm95r-guide"],
];

const caseRows = [
  ["쏘렌토 MQ4 AGM 다운그레이드", "시동 지연 재발", "AGM95L 권장"],
  ["EV6 12V 재방전", "대기전류 상승", "SOH 79%"],
  ["BMW G30 등록 누락", "충전 제어 오류", "BMS 등록"],
  ["블랙박스 컷오프 낮음", "3일 주차 후 방전", "12.2V+"],
];

export default function ContentsPage() {
  return (
    <main className="min-h-screen bg-[var(--bm-page-bg)] text-slate-950">
      <PortalHeader title="가이드" showSearch searchPlaceholder="AGM, BMS, EV 12V 가이드 검색" />
      <section className="mx-auto grid max-w-[1280px] gap-3 px-4 py-4 lg:grid-cols-[240px_1fr_300px]">
        <aside className="space-y-3">
          <Panel title="가이드 카테고리">
            {["AGM/EFB", "EV 12V", "BMS/IBS", "블랙박스", "겨울철", "교체 가이드"].map((item) => (
              <a className="mb-1.5 block rounded-lg bg-slate-50 px-3 py-2 text-xs font-black text-slate-600 ring-1 ring-slate-200 hover:bg-blue-50" href={`/search?q=${encodeURIComponent(item)}`} key={item}>{item}</a>
            ))}
          </Panel>
          <Panel title="배터리 용어">
            <div className="flex flex-wrap gap-1.5">
              {["CCA", "SOH", "OCV", "RC", "LN4", "DIN H7", "대기전류", "BMS 초기화"].map((tag) => (
                <span className="rounded-md bg-white px-2 py-1 text-[10px] font-black text-slate-500 ring-1 ring-slate-200" key={tag}>{tag}</span>
              ))}
            </div>
          </Panel>
        </aside>

        <section className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <p className="text-[10px] font-black text-blue-600">배터리 가이드</p>
            <h1 className="mt-1 text-lg font-black tracking-[-0.04em]">최신 가이드 · 정비 사례 · 규격 데이터</h1>
            <div className="mt-3 grid gap-2 md:grid-cols-5">
              {["최신순", "인기순", "전문가검수", "EV 12V", "AGM 호환"].map((tab, index) => (
                <a className={`rounded-lg px-3 py-2 text-center text-xs font-black ${index === 0 ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600"}`} href="#" key={tab}>{tab}</a>
              ))}
            </div>
          </div>

          <Panel title="최신 배터리 가이드">
            <div className="space-y-2">
              {guideRows.map(([title, desc, tag, source, href], index) => (
                <article className="grid gap-3 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200 hover:bg-white hover:shadow-md md:grid-cols-[94px_1fr_150px]" key={title}>
                  <Thumb label={tag} index={index} />
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="rounded-md bg-blue-50 px-2 py-1 text-[10px] font-black text-blue-600">{source}</span>
                      <span className="rounded-md bg-white px-2 py-1 text-[10px] font-black text-slate-500 ring-1 ring-slate-200">{tag}</span>
                    </div>
                    <h2 className="mt-2 text-base font-black">{title}</h2>
                    <p className="mt-1 text-xs font-semibold text-slate-500">{desc}</p>
                  </div>
                  <div className="text-xs font-bold text-slate-500 md:text-right">
                    <a className="mt-3 inline-flex rounded-lg bg-white px-3 py-1.5 font-black text-slate-700 ring-1 ring-slate-200 hover:bg-blue-600 hover:text-white" href={href}>자세히 보기</a>
                  </div>
                </article>
              ))}
            </div>
          </Panel>
        </section>

        <aside className="space-y-3">
          <Panel title="실제 사용자 사례">
            <div className="space-y-2">
              {caseRows.map(([title, issue, result]) => (
                <a className="block rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200 hover:bg-blue-50" href={`/ai/chat?q=${encodeURIComponent(title)}`} key={title}>
                  <p className="text-xs font-black">{title}</p>
                  <p className="mt-1 text-[11px] font-bold text-slate-500">{issue}</p>
                  <p className="mt-1 text-[11px] font-black text-blue-600">{result}</p>
                </a>
              ))}
            </div>
          </Panel>
          <Panel title="비교 바로가기">
            <a className="block rounded-xl bg-slate-950 p-3 text-xs font-black text-cyan-100" href="/compare">AGM80L · AGM70L · DIN74L 비교</a>
          </Panel>
        </aside>
      </section>
    </main>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"><div className="mb-2 border-b border-slate-100 pb-2"><h2 className="text-sm font-black">{title}</h2></div>{children}</section>;
}

function Thumb({ label, index }: { label: string; index: number }) {
  const tones = ["from-slate-950 to-blue-600", "from-cyan-700 to-blue-500", "from-slate-800 to-slate-500", "from-indigo-700 to-blue-500", "from-sky-500 to-blue-300"];
  return <div className={`relative h-20 overflow-hidden rounded-xl bg-gradient-to-br ${tones[index % tones.length]} p-2 text-white`}><div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.35),transparent_34%)]" /><span className="relative rounded-md bg-white/15 px-2 py-1 text-[10px] font-black">{label}</span><div className="absolute bottom-2 left-2 right-2 h-5 rounded-full bg-white/20 blur-sm" /></div>;
}

