"use client";

import { useCallback, useMemo, useState } from "react";
import { SEARCH_QUALITY_DEFAULT_QUERIES } from "@/lib/search/search-quality-testset";
import type { SearchQAResult } from "@/lib/search/search-quality-types";

type Row = SearchQAResult & { index: number; status: "ok" | "error"; error?: string };

function codesSummary(r: SearchQAResult): string {
  const codes = [
    ...r.primaryResult.batteryCodes,
    ...r.batteryResults.slice(0, 3).map((b) => b.code),
    ...r.generationCards.flatMap((g) => g.batteryCodes),
  ];
  const uniq = [...new Set(codes.map((c) => c.toUpperCase()))].filter(Boolean);
  return uniq.slice(0, 6).join(", ") || "—";
}

function branchSummary(r: SearchQAResult): string {
  if (r.branchGuide.visible) return "Y";
  if (r.successType === "generation_select") return "세대";
  if (r.successType === "year_branch") return "연식";
  if (r.successType === "fuel_trim_branch") return "연료";
  return "—";
}

function warningSummary(r: SearchQAResult): string {
  if (r.warnings.length === 0) return "—";
  const top = r.warnings[0]!;
  return `${top.level}: ${top.message}`;
}

function toCsv(rows: Row[]): string {
  const header = [
    "번호",
    "검색어",
    "인식의도",
    "성공유형",
    "대표결과",
    "규격",
    "분기",
    "Q&A수",
    "CTA",
    "경고",
    "URL",
  ].join(",");
  const lines = rows.map((r) =>
    [
      r.index,
      `"${r.query.replace(/"/g, '""')}"`,
      r.detectedIntent,
      r.successType,
      `"${r.primaryResult.title.replace(/"/g, '""')}"`,
      `"${codesSummary(r).replace(/"/g, '""')}"`,
      branchSummary(r),
      r.relatedQa.length,
      r.ctas.length,
      `"${warningSummary(r).replace(/"/g, '""')}"`,
      r.primaryResult.url || r.vehicleResults[0]?.url || "",
    ].join(","),
  );
  return [header, ...lines].join("\n");
}

export function SearchQualityClient() {
  const [input, setInput] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [jsonOpen, setJsonOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const queries = useMemo(
    () =>
      input
        .split(/\n/)
        .map((s) => s.trim())
        .filter(Boolean),
    [input],
  );

  const runOne = useCallback(async (query: string, index: number): Promise<Row> => {
    const res = await fetch(`/api/qa/search-quality?q=${encodeURIComponent(query)}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return {
        index,
        query,
        normalizedQuery: query,
        detectedIntent: "unknown",
        successType: "unknown",
        summary: `API error ${res.status}`,
        recognized: false,
        primaryResult: {
          type: "none",
          title: "",
          slug: "",
          url: "",
          batteryCodes: [],
          reason: "",
        },
        vehicleResults: [],
        batteryResults: [],
        generationCards: [],
        branchGuide: { visible: false, message: "", branches: [] },
        relatedQa: [],
        ctas: [],
        warnings: [{ level: "error", message: `HTTP ${res.status}`, reason: "api_error" }],
        debug: {
          matchedTokens: [],
          rankingRules: [],
          excludedResults: [],
          dataSource: [],
          vehiclesTotal: 0,
          uxMode: "error",
        },
        status: "error",
        error: `HTTP ${res.status}`,
      };
    }
    const data = (await res.json()) as SearchQAResult;
    return { ...data, index, status: "ok" };
  }, []);

  const runBatch = useCallback(async () => {
    if (queries.length === 0) return;
    setLoading(true);
    const results: Row[] = [];
    for (let i = 0; i < queries.length; i++) {
      const q = queries[i]!;
      results.push(await runOne(q, i + 1));
      setRows([...results]);
    }
    setLoading(false);
    setSelectedIndex(results[0] ? 1 : null);
  }, [queries, runOne]);

  const loadDefault50 = () => {
    setInput(SEARCH_QUALITY_DEFAULT_QUERIES.join("\n"));
  };

  const copyJson = async () => {
    await navigator.clipboard.writeText(JSON.stringify(rows, null, 2));
  };

  const copyCsv = async () => {
    await navigator.clipboard.writeText(toCsv(rows));
  };

  const selected = rows.find((r) => r.index === selectedIndex) ?? null;

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 px-4 py-8 font-sans text-slate-900">
      <header className="space-y-2 border-b border-slate-200 pb-6">
        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Internal QA</p>
        <h1 className="text-2xl font-black">검색 품질 QA</h1>
        <p className="max-w-3xl text-sm font-medium text-slate-600">
          고객 검색과 동일한 <code className="rounded bg-slate-100 px-1">runBatterySearch</code> 결과를 JSON/표로
          검수합니다. API: <code className="rounded bg-slate-100 px-1">GET /api/qa/search-quality?q=</code>
        </p>
      </header>

      <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <label className="block text-xs font-bold text-slate-700" htmlFor="qa-queries">
          검색어 (한 줄에 하나)
        </label>
        <textarea
          id="qa-queries"
          className="min-h-[140px] w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="K3&#10;쏘렌토 MQ4 하이브리드&#10;AGM70L"
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
            disabled={loading || queries.length === 0}
            onClick={() => void runBatch()}
          >
            {loading ? "검수 중…" : `검수 실행 (${queries.length}개)`}
          </button>
          <button
            type="button"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
            onClick={loadDefault50}
          >
            기본 50개 검색어 불러오기
          </button>
          {rows.length > 0 ? (
            <>
              <button
                type="button"
                className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-600"
                onClick={() => void copyJson()}
              >
                JSON 복사
              </button>
              <button
                type="button"
                className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-600"
                onClick={() => void copyCsv()}
              >
                CSV 복사
              </button>
              <button
                type="button"
                className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-600"
                onClick={() => setJsonOpen((v) => !v)}
              >
                {jsonOpen ? "JSON 접기" : "JSON 펼치기"}
              </button>
            </>
          ) : null}
        </div>
      </section>

      {rows.length > 0 ? (
        <section className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[1100px] text-left text-xs">
            <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-500">
              <tr>
                <th className="px-2 py-2">#</th>
                <th className="px-2 py-2">검색어</th>
                <th className="px-2 py-2">인식 의도</th>
                <th className="px-2 py-2">성공 유형</th>
                <th className="px-2 py-2">대표 결과</th>
                <th className="px-2 py-2">추천/분기 규격</th>
                <th className="px-2 py-2">분기</th>
                <th className="px-2 py-2">Q&A</th>
                <th className="px-2 py-2">CTA</th>
                <th className="px-2 py-2">경고</th>
                <th className="px-2 py-2">상세 URL</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.index}
                  className={`cursor-pointer border-t border-slate-100 hover:bg-blue-50/40 ${
                    selectedIndex === r.index ? "bg-blue-50/60" : ""
                  }`}
                  onClick={() => setSelectedIndex(r.index)}
                >
                  <td className="px-2 py-2 font-mono">{r.index}</td>
                  <td className="px-2 py-2 font-semibold">{r.query}</td>
                  <td className="px-2 py-2">{r.detectedIntent}</td>
                  <td className="px-2 py-2">{r.successType}</td>
                  <td className="max-w-[12rem] truncate px-2 py-2" title={r.primaryResult.title}>
                    {r.primaryResult.title || "—"}
                  </td>
                  <td className="max-w-[10rem] truncate px-2 py-2">{codesSummary(r)}</td>
                  <td className="px-2 py-2">{branchSummary(r)}</td>
                  <td className="px-2 py-2">{r.relatedQa.length}</td>
                  <td className="px-2 py-2">{r.ctas.length}</td>
                  <td className="max-w-[14rem] truncate px-2 py-2 text-amber-800" title={warningSummary(r)}>
                    {warningSummary(r)}
                  </td>
                  <td className="max-w-[10rem] truncate px-2 py-2 font-mono text-[10px]">
                    {r.primaryResult.url || r.vehicleResults[0]?.url || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}

      {selected ? (
        <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h2 className="text-sm font-black">검수 메모 — {selected.query}</h2>
          <p className="mt-1 text-sm text-slate-700">{selected.summary}</p>
          <ul className="mt-3 list-inside list-disc space-y-1 text-xs text-slate-600">
            <li>차량 {selected.vehicleResults.length}건 · 규격 {selected.batteryResults.length}건</li>
            <li>세대 카드 {selected.generationCards.length}건</li>
            {selected.warnings.map((w, i) => (
              <li key={i} className={w.level === "error" ? "text-red-700" : "text-amber-800"}>
                [{w.level}] {w.message}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {jsonOpen && rows.length > 0 ? (
        <pre className="max-h-[480px] overflow-auto rounded-xl border border-slate-200 bg-slate-950 p-4 text-[11px] text-emerald-100">
          {JSON.stringify(rows, null, 2)}
        </pre>
      ) : null}
    </div>
  );
}
