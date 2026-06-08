import { getBattery } from "@/lib/platform-data";
import type { HomeSearchType } from "@/lib/home-search-types";
import {
  detectSearchIntent,
  mapDetectedIntent,
  runBatterySearch,
  type RunBatterySearchOptions,
} from "@/lib/search/run-battery-search";
import { evaluateSearchQualityRules, codesInText } from "@/lib/search/search-quality-rules";
import type {
  SearchQADetectedIntent,
  SearchQAResult,
  SearchQASuccessType,
} from "@/lib/search/search-quality-types";
import { isSorentoMq4AmbiguousQuery } from "@/lib/search/sorento-mq4-fuel-split";

const SITE_ORIGIN =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://www.batterymanager.co.kr";

function absUrl(path: string): string {
  if (!path) return SITE_ORIGIN;
  if (path.startsWith("http")) return path;
  return `${SITE_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}

function slugFromHref(href: string): string {
  const m = href.match(/\/vehicle\/([^/?#]+)/);
  return m?.[1] ?? "";
}

function resolveSuccessType(
  data: ReturnType<typeof runBatterySearch>,
  detectedIntent: SearchQADetectedIntent,
): SearchQASuccessType {
  if (data.symptomDiagnosisFirst) return "symptom_qa";
  if (data.recognizedVehicle?.yearBranchLinks && data.recognizedVehicle.yearBranchLinks.length > 0) {
    return "year_branch";
  }
  if (
    data.ux.conditionChips.some((c) => c.variant === "fuel") ||
    isSorentoMq4AmbiguousQuery(data.query)
  ) {
    return "fuel_trim_branch";
  }
  if (data.vehicles.length > 1 && !data.recognizedVehicle) return "generation_select";
  if (data.recognizedVehicle?.primaryBatteryCode) return "immediate_confirmed";
  if (data.recognizedSpec?.primaryBatteryCode || data.queryHasBatterySpec) return "battery_code";
  if (data.ux.mode === "purpose" || detectedIntent === "service" || detectedIntent === "shipping") {
    return "service_purchase";
  }
  if (data.vehicles.length === 1 && data.recognizedVehicle) return "immediate_confirmed";
  return "unknown";
}

function buildSummaryLine(
  query: string,
  data: ReturnType<typeof runBatterySearch>,
  successType: SearchQASuccessType,
  detectedIntent: SearchQADetectedIntent,
): string {
  if (data.recognizedVehicle?.primaryBatteryCode) {
    return `${data.recognizedVehicle.vehicleLabel} — ${data.recognizedVehicle.primaryBatteryCode} 확정 후보`;
  }
  if (successType === "generation_select") {
    return `"${query}" — ${data.vehiclesTotal}개 차량·세대 후보, 세대 선택 필요`;
  }
  if (successType === "fuel_trim_branch") {
    return `"${query}" — 연료·트림별 규격 분기`;
  }
  if (successType === "symptom_qa") {
    return `"${query}" — 증상·Q&A·안내 우선`;
  }
  if (successType === "battery_code" && data.batteries[0]) {
    return `"${query}" — 배터리 규격 ${data.batteries[0].code} 중심`;
  }
  if (data.vehicles.length === 0 && data.batteries.length === 0) {
    return `"${query}" — 인식 결과 없음 (${detectedIntent})`;
  }
  return `"${query}" — ${data.intent.label}: ${data.vehicles.length}대 차량, ${data.batteries.length}개 규격`;
}

/**
 * 검색 페이지와 동일한 runBatterySearch 결과를 QA JSON으로 변환한다.
 */
export function buildSearchQAResult(
  rawQuery: string,
  options?: RunBatterySearchOptions,
): SearchQAResult {
  const searchType: HomeSearchType = options?.searchType ?? "all";
  const pipeline = detectSearchIntent(rawQuery, options);
  const data = runBatterySearch(rawQuery, options);
  const detectedIntent = mapDetectedIntent(pipeline, searchType);
  const successType = resolveSuccessType(data, detectedIntent);
  const recognized = Boolean(
    data.recognizedVehicle ||
      data.recognizedSpec ||
      data.vehicles.length > 0 ||
      data.batteries.length > 0 ||
      data.hero,
  );

  const primaryBatteryCodes = [
    ...(data.recognizedVehicle?.primaryBatteryCode
      ? [data.recognizedVehicle.primaryBatteryCode]
      : []),
    ...(data.recognizedVehicle?.candidateBatteryCodes ?? []),
    ...(data.recognizedSpec?.primaryBatteryCode ? [data.recognizedSpec.primaryBatteryCode] : []),
    ...(data.compareBatteryCodes ?? []),
  ].filter(Boolean);

  let primaryResult: SearchQAResult["primaryResult"] = {
    type: "none",
    title: "",
    slug: "",
    url: "",
    batteryCodes: [],
    reason: "대표 결과 없음",
  };

  if (data.recognizedVehicle) {
    primaryResult = {
      type: "vehicle",
      title: data.recognizedVehicle.title,
      slug: slugFromHref(data.recognizedVehicle.href),
      url: absUrl(data.recognizedVehicle.href),
      batteryCodes: primaryBatteryCodes,
      reason: data.recognizedVehicle.basisLabel ?? data.recognizedVehicle.guidance,
    };
  } else if (data.recognizedSpec?.primaryBatteryCode) {
    primaryResult = {
      type: "battery",
      title: data.recognizedSpec.primaryBatteryCode,
      slug: data.recognizedSpec.primaryBatteryCode,
      url: absUrl(`/batteries/${encodeURIComponent(data.recognizedSpec.primaryBatteryCode)}`),
      batteryCodes: [data.recognizedSpec.primaryBatteryCode],
      reason: data.recognizedSpec.secondaryNote || "규격 인식",
    };
  } else if (data.batteries[0]) {
    primaryResult = {
      type: "battery",
      title: data.batteries[0].code,
      slug: data.batteries[0].code,
      url: absUrl(data.batteries[0].href),
      batteryCodes: [data.batteries[0].code],
      reason: "상위 배터리 매칭",
    };
  } else if (data.vehicles[0]) {
    const v = data.vehicles[0];
    primaryResult = {
      type: "vehicle",
      title: v.model,
      slug: slugFromHref(v.href),
      url: absUrl(v.href),
      batteryCodes: codesInText(`${v.recommend} ${v.upgrade} ${v.batteryNotes ?? ""}`),
      reason: v.note ?? "상위 차량 매칭",
    };
  } else if (data.symptomDiagnosisFirst) {
    primaryResult = {
      type: "symptom",
      title: data.summary.symptomKeywords[0] ?? "증상",
      slug: "",
      url: absUrl("/symptoms"),
      batteryCodes: [],
      reason: "증상 우선 모드",
    };
  }

  const vehicleResults = data.vehicles.map((v, i) => ({
    title: v.model,
    slug: slugFromHref(v.href),
    url: absUrl(v.href),
    generation: v.model,
    yearRange: v.year,
    fuel: v.fuel,
    batteryCodes: codesInText(`${v.recommend} ${v.upgrade} ${v.batteryNotes ?? ""}`),
    matchScore: Math.max(55, 100 - i * 4),
    matchReason: v.note ?? v.batteryNotes ?? "vehicle-db/asset match",
  }));

  const batteryResults = data.batteries.map((b, i) => {
    const meta = getBattery(b.code);
    return {
      code: b.code,
      brandExamples: [meta.brandId === "solite" ? "쏠라이트" : "로케트"],
      url: absUrl(b.href),
      applicableVehicles: meta.vehicleIds?.slice(0, 5) ?? [],
      matchScore: b.score ?? Math.max(65, 95 - i * 3),
      matchReason: b.subtitle || b.variantNote || "battery index",
    };
  });

  const generationCards =
    data.vehicles.length > 1 && !data.recognizedVehicle
      ? data.vehicles.map((v) => ({
          title: v.model,
          url: absUrl(v.href),
          batteryCodes: codesInText(`${v.recommend} ${v.upgrade}`),
          guideText: v.batteryNotes ?? v.note ?? "",
        }))
      : [];

  const branchBranches: SearchQAResult["branchGuide"]["branches"] = [];

  if (data.recognizedVehicle?.yearBranchLinks?.length) {
    for (const link of data.recognizedVehicle.yearBranchLinks) {
      branchBranches.push({
        label: link.label,
        condition: "연식 분기",
        batteryCodes: codesInText(link.label),
        url: absUrl(link.href),
      });
    }
  }

  for (const chip of data.ux.conditionChips) {
    branchBranches.push({
      label: chip.label,
      condition: chip.variant ?? "hint",
      batteryCodes: codesInText(chip.label),
      url: absUrl(chip.href),
    });
  }

  const branchGuide: SearchQAResult["branchGuide"] = {
    visible: branchBranches.length > 0 || Boolean(data.ux.yearBranchHint),
    message:
      data.ux.yearBranchHint ??
      (generationCards.length > 1
        ? "세대별로 규격이 다를 수 있어 아래에서 세대를 선택해 주세요."
        : ""),
    branches: branchBranches,
  };

  const relatedQa = data.questions.slice(0, 8).map((q) => ({
    title: q.title,
    url: absUrl(q.href),
    relatedBatteryCodes: codesInText(`${q.title} ${q.subtitle}`),
    relatedVehicleSlugs: [],
    matchReason: q.subtitle ?? "searchAll qa",
  }));

  const ctas: SearchQAResult["ctas"] = data.ctas.map((c, i) => {
    const priority: "primary" | "secondary" | "tertiary" =
      i === 0 ? "primary" : i === 1 ? "secondary" : "tertiary";
    return {
      label: c.label,
      url: absUrl(c.href),
      priority,
      reason: "search-page-results cta",
    };
  });

  const summary = buildSummaryLine(rawQuery, data, successType, detectedIntent);

  const result: SearchQAResult = {
    query: rawQuery,
    normalizedQuery: data.query || pipeline.normalizedQuery,
    detectedIntent,
    successType,
    summary,
    recognized,
    primaryResult,
    vehicleResults,
    batteryResults,
    generationCards,
    branchGuide,
    relatedQa,
    ctas,
    warnings: [],
    debug: {
      matchedTokens: [
        ...pipeline.symptom.symptoms,
        ...pipeline.purpose.purposes,
        ...(pipeline.batterySpec.specs ?? []),
        pipeline.vehicle.model,
        pipeline.vehicle.displayName,
      ].filter((t): t is string => Boolean(t)),
      rankingRules: [
        `ux.mode=${data.ux.mode}`,
        `intent.type=${data.intent.type}`,
        `topFold.deferSecondary=${data.deferSecondary}`,
        `symptomDiagnosisFirst=${data.symptomDiagnosisFirst}`,
      ],
      excludedResults: [
        data.vehiclesTotal > data.vehicles.length
          ? `vehicles:${data.vehiclesTotal - data.vehicles.length} hidden by topFold`
          : "",
        data.batteriesTotal > data.batteries.length
          ? `batteries:${data.batteriesTotal - data.batteries.length} hidden by topFold`
          : "",
      ].filter(Boolean),
      dataSource: [
        "buildSearchPageResults",
        "vehicle-battery-db",
        "car-assets",
        "searchAll",
      ],
      searchType,
      vehiclesTotal: data.vehiclesTotal,
      uxMode: data.ux.mode,
    },
  };

  result.warnings = evaluateSearchQualityRules(rawQuery, result);
  return result;
}
