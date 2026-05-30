import { unstable_noStore as noStore } from "next/cache";
import { SearchActivityRecorder } from "@/components/platform/SearchActivityRecorder";
import { SearchResultsView } from "@/components/platform/SearchResultsView";
import { Breadcrumb, PortalHeader } from "@/components/portal";
import { bm } from "@/lib/design-tokens";
import { getSearchHref } from "@/lib/battery-search";
import { getRelatedForQuery } from "@/lib/platform-data";
import { buildSearchPageResults } from "@/lib/search-page-results";

/** 검색 결과·CTA가 배포 스탬프와 함께 갱신되도록 동적 렌더 */
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tab?: string; filter?: string }>;
}) {
  noStore();
  const params = await searchParams;
  const rawQuery = params.q?.trim() ?? "";
  const results = buildSearchPageResults(rawQuery);
  const displayQuery = results.displayQuery || results.query;

  let related;
  try {
    related = getRelatedForQuery(displayQuery || "AGM80L");
  } catch (err) {
    console.error("[search] related/intent failed:", err);
    related = getRelatedForQuery("AGM80L");
  }
  const ctxVehicle = related.vehicle;
  const ctxBattery = related.battery?.code ?? ctxVehicle?.recommendedBattery ?? "";

  const relatedKeywords = [
    ...results.relatedKeywords,
    ...(displayQuery || results.upgradeGuidance ? [] : ["쏘렌토 MQ4", "그랜저 IG AGM80L", "포터2 100R"]),
  ]
    .filter((k) => !results.upgradeGuidance || !/\b(AGM|DIN|CMF)\d/i.test(k))
    .filter((k, i, arr) => arr.indexOf(k) === i)
    .slice(0, 5);

  return (
    <main className={bm.pageBg}>
      <SearchActivityRecorder
        matchedBattery={ctxBattery}
        matchedVehicle={ctxVehicle?.name}
        query={displayQuery}
      />
      <PortalHeader showSearch defaultQuery={displayQuery} searchPlaceholder="차종, 증상, 배터리 규격 검색" />

      <section className="mx-auto max-w-[1280px] px-4 py-4">
        <Breadcrumb
          items={[
            { label: "홈", href: "/" },
            { label: "통합검색", href: "/search" },
            { label: displayQuery || "검색" },
          ]}
        />
      </section>

      <section className="mx-auto grid max-w-[960px] gap-4 px-4 pb-10 lg:max-w-[1280px] lg:grid-cols-[1fr_240px]">
        <SearchResultsView data={results} />

        <aside className="space-y-3 lg:sticky lg:top-4 lg:self-start">
          {relatedKeywords.length > 0 ? (
            <section className={`${bm.card} p-4`}>
              <h2 className="text-sm font-black text-slate-950">관련 검색</h2>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {relatedKeywords.map((keyword) => (
                  <a
                    className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200 transition hover:bg-blue-50 hover:text-blue-700"
                    href={getSearchHref(keyword)}
                    key={keyword}
                  >
                    {keyword}
                  </a>
                ))}
              </div>
            </section>
          ) : null}

          {displayQuery &&
          results.showSymptomSidebar &&
          related.intent.type === "symptom" &&
          related.intent.symptom ? (
            <section className={`${bm.card} p-4`}>
              <h2 className="text-sm font-black text-slate-950">증상 확인</h2>
              <p className="mt-1 text-xs font-medium text-slate-500">{related.intent.symptom.subtitle}</p>
              <a
                className={`${bm.btnPrimary} mt-3 inline-flex w-full justify-center text-xs`}
                href={`/diagnosis/${related.intent.symptom.id}`}
              >
                {related.intent.symptom.title} 확인
              </a>
            </section>
          ) : null}
        </aside>
      </section>
    </main>
  );
}
