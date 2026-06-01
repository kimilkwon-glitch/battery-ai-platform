import {
  ArticleCard,
  MetaInfoRow,
  MiniStatCard,
  PortalHeader,
  PortalPanel,
  PopularKeywordWidget,
  RankingWidget,
  RightSidebar,
  StatusBadge,
} from "@/components/portal";
import { getAiAnswerExperience, suggestedQuestions } from "@/lib/ai-question-data";

export default async function AiChatPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const answer = getAiAnswerExperience(q);

  return (
    <main className="min-h-screen bg-[var(--bm-page-bg)] pb-24 text-slate-950">
      <PortalHeader title="규격 문의" />
      <section className="mx-auto max-w-[1280px] px-4 py-4">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
          <div>
            <p className="text-[10px] font-black text-blue-600">배터리 Q&A</p>
            <h1 className="text-lg font-black tracking-[-0.04em]">{answer.intent}</h1>
          </div>
          <p className="max-w-xl text-xs font-semibold text-slate-500">{answer.shortAnswer.slice(0, 80)}…</p>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1fr_300px]">
          <section className="space-y-3">
            <PortalPanel title="질문" meta="USER">
              <p className="text-sm font-black">{answer.question}</p>
            </PortalPanel>

            <PortalPanel title="답변" meta="분석 완료">
              <p className="text-sm font-semibold leading-6 text-slate-600">{answer.shortAnswer}</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {answer.cards.map((card) => (
                  <div className="rounded-lg bg-slate-50 p-2 ring-1 ring-slate-200" key={card.title}>
                    <div className={`mb-2 h-1 rounded bg-gradient-to-r ${card.tone}`} />
                    <p className="text-[10px] font-black text-blue-600">{card.title}</p>
                    <p className="mt-1 text-sm font-black">{card.value}</p>
                    <p className="mt-1 text-[10px] font-semibold text-slate-500">{card.detail}</p>
                  </div>
                ))}
              </div>
            </PortalPanel>

            <PortalPanel title="추천 질문">
              <PopularKeywordWidget items={suggestedQuestions.map((item) => item.question)} />
            </PortalPanel>
          </section>

          <RightSidebar>
            <PortalPanel title="진단 요약">
              <MiniStatCard label="위험도" value={answer.risk} />
              <MiniStatCard label="긴급도" value={answer.urgency} meta="판정" />
              <MetaInfoRow label="추천 배터리" value={answer.recommendedBattery} />
            </PortalPanel>
            <RankingWidget title="대시보드" items={answer.widgets.map(([label, value]) => [label, value])} />
            <PortalPanel title="관련 질문">
              {answer.relatedQuestions.slice(0, 4).map((item, index) => (
                <ArticleCard title={item} meta="관련" href={`/ai/chat?q=${encodeURIComponent(item)}`} index={index} key={item} />
              ))}
            </PortalPanel>
            <PortalPanel title="추천 배터리">
              {answer.batteries.slice(0, 4).map((item) => (
                <a className="mb-1 block rounded-lg bg-slate-50 px-2 py-1.5 text-xs font-black ring-1 ring-slate-200 hover:bg-blue-50" href={`/search?q=${encodeURIComponent(item)}`} key={item}>
                  {item}
                </a>
              ))}
            </PortalPanel>
            <PortalPanel title="상태">
              <StatusBadge tone="green">응답 완료</StatusBadge>
              <StatusBadge tone="blue">AGM · BMS · CCA 분석</StatusBadge>
            </PortalPanel>
          </RightSidebar>
        </div>
      </section>

      <form action="/ai/chat" className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto grid max-w-[1280px] gap-2 md:grid-cols-[1fr_auto]">
          <input
            className="h-10 rounded-lg bg-slate-50 px-3 text-sm font-bold ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-300"
            defaultValue={answer.question}
            name="q"
            placeholder="배터리 증상이나 차종을 입력하세요"
            type="search"
          />
          <button className="rounded-lg bg-blue-600 px-5 text-xs font-black text-white hover:bg-blue-700">질문 보내기</button>
        </div>
      </form>
    </main>
  );
}
