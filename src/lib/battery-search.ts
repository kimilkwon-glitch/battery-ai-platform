import { searchVehicleAssets, vehicleAssetBrandLabel, vehicleAssetHref } from "./car-assets";

export type SearchTab = "all" | "vehicles" | "problems" | "batteries" | "guides";
export type SearchFilter = "all" | "agm" | "ev12v" | "diagnosis" | "winter";

export type BatterySearchResult = {
  id: string;
  type: Exclude<SearchTab, "all">;
  title: string;
  subtitle: string;
  summary: string;
  score: string;
  href: string;
  badges: string[];
  metrics: [string, string][];
  filters: SearchFilter[];
};

export type SearchExperience = {
  query: string;
  intent: string;
  headline: string;
  summary: string;
  confidence: string;
  tabs: { id: SearchTab; label: string; count: number }[];
  filters: { id: SearchFilter; label: string }[];
  related: string[];
  results: BatterySearchResult[];
};

const defaultQuery = "쏘렌토 MQ4 AGM";

export const searchFilters: { id: SearchFilter; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "agm", label: "AGM/EFB" },
  { id: "ev12v", label: "EV 12V" },
  { id: "diagnosis", label: "증상 진단" },
  { id: "winter", label: "겨울/CCA" },
];

export const searchResults: BatterySearchResult[] = [
  {
    id: "grandeur-ig-agm80l",
    type: "vehicles",
    title: "그랜저 IG",
    subtitle: "AGM80L 권장 · ISG 트림 AGM 유지",
    summary: "그랜저 IG는 AGM80L 순정이 일반적입니다. AGM95L 업그레이드는 공간·CCA·충전 제어를 확인한 뒤 선택하세요.",
    score: "호환 96%",
    href: "/vehicle/grandeur-ig",
    badges: ["AGM80L", "AGM95L", "ISG", "검색 15,240"],
    metrics: [["순정", "AGM80L"], ["업그레이드", "AGM95L"], ["OCV", "12.4V+"]],
    filters: ["agm"],
  },
  {
    id: "seltos-agm60l",
    type: "vehicles",
    title: "셀토스",
    subtitle: "AGM60L 권장 · AGM70L 업그레이드 문의",
    summary: "셀토스 ISG 트림은 AGM60L 유지가 안전합니다. AGM70L은 용량업 후보로 검색량이 많습니다.",
    score: "호환 93%",
    href: "/vehicle/seltos",
    badges: ["AGM60L", "AGM70L", "ISG", "Q&A 842건"],
    metrics: [["순정", "AGM60L"], ["업그레이드", "AGM70L"], ["CCA", "680A"]],
    filters: ["agm"],
  },
  {
    id: "sorento-mq4-agm95l",
    type: "vehicles",
    title: "쏘렌토 MQ4",
    subtitle: "AGM95L 권장 · ISG/IBS 적용 차량",
    summary:
      "MQ4 디젤/하이브리드 주요 트림은 순정 AGM 규격 유지가 안정적입니다. IBS 초기화 여부와 장착 공간을 함께 확인하세요.",
    score: "호환 98%",
    href: "/vehicle/sorento-mq4",
    badges: ["AGM95L", "ISG", "IBS", "실차 사례 2,138건"],
    metrics: [["SOH 기준", "85%↓ 점검"], ["CCA", "760A급"], ["OCV", "12.5V 이상 권장"]],
    filters: ["agm", "diagnosis"],
  },
  {
    id: "agm80l-standard",
    type: "batteries",
    title: "AGM80L 배터리",
    subtitle: "그랜저 GN7, K8, 일부 수입차 호환 후보",
    summary:
      "AGM80L은 ISG 차량에서 검색량이 높은 규격입니다. 순정 Ah/CCA, 터미널 방향, 배터리 등록 필요 여부를 비교해야 합니다.",
    score: "규격 신뢰도 96%",
    href: "/search?q=AGM80L",
    badges: ["80Ah", "L 타입", "ISG 대응", "BMS 충전 제어"],
    metrics: [["추천 차종", "GN7/K8"], ["검색 증가", "+18%"], ["검수", "제조사 규격"]],
    filters: ["agm"],
  },
  {
    id: "ev6-12v-drain",
    type: "vehicles",
    title: "EV6 12V 보조배터리 방전",
    subtitle: "EV 보조전원 · 반복 방전 진단 우선",
    summary:
      "EV6 반복 방전은 보조배터리 SOH, 주차 대기 전류, OTA 이후 충전 패턴을 같이 봐야 합니다. 단순 교체 전 진단을 권장합니다.",
    score: "진단 91%",
    href: "/vehicle/ev6",
    badges: ["EV 12V", "BMS", "SOH", "재방전 위험"],
    metrics: [["12V 전압", "12.4V↓ 주의"], ["재검색", "+12%"], ["점검", "대기전류"]],
    filters: ["ev12v", "diagnosis"],
  },
  {
    id: "slow-engine-start",
    type: "problems",
    title: "시동이 늦게 걸림",
    subtitle: "CCA/SOH 저하 · 겨울철 악화 가능",
    summary:
      "시동 지연은 OCV 12.4V 이하, CCA 여유율 부족, 짧은 주행으로 인한 충전 회복 부족이 함께 나타날 때 자주 발생합니다.",
    score: "원인 매칭 94%",
    href: "/diagnosis/slow-engine-start",
    badges: ["OCV", "CCA", "SOH", "시동 지연"],
    metrics: [["우선 점검", "전압/CCA"], ["위험 신호", "딸깍 소리"], ["계절성", "영하권"]],
    filters: ["diagnosis", "winter"],
  },
  {
    id: "blackbox-drain",
    type: "problems",
    title: "블랙박스 상시전원 방전",
    subtitle: "암전류 · 컷오프 전압 · 주행 패턴",
    summary:
      "주차 녹화 시간이 길고 컷오프 전압이 낮으면 AGM 배터리도 반복 방전될 수 있습니다. 12.2V 이상 컷오프 설정을 먼저 확인하세요.",
    score: "암전류 의심 68%",
    href: "/diagnosis/blackbox-drain",
    badges: ["암전류", "컷오프 12.2V", "주차녹화", "재방전"],
    metrics: [["최근 사례", "8,930건"], ["권장", "12.2V+"], ["점검", "대기전류"]],
    filters: ["diagnosis"],
  },
  {
    id: "winter-cca",
    type: "guides",
    title: "겨울철 CCA 여유율 가이드",
    subtitle: "영하권 시동 지연과 배터리 수명 신호",
    summary:
      "기온이 낮아지면 동일한 SOH에서도 체감 시동 성능이 크게 떨어집니다. OCV, CCA, 최근 주행 시간을 함께 보는 것이 정확합니다.",
    score: "데이터 일치도 89%",
    href: "/diagnosis/winter-discharge",
    badges: ["CCA", "영하권", "SOH", "교체 시점"],
    metrics: [["검색 증가", "+14%"], ["핵심 지표", "CCA"], ["권장", "부하 테스트"]],
    filters: ["winter", "diagnosis"],
  },
];

const scenarios = [
  {
    match: ["그랜저", "grandeur", "ig"],
    intent: "그랜저 IG AGM 호환",
    headline: "그랜저 IG는 AGM80L 순정·AGM95L 업그레이드를 확인하세요",
    summary: "ISG 트림은 AGM 유지가 안전합니다. 터미널 방향과 BMS/IBS 여부를 함께 보세요.",
    confidence: "96%",
    related: ["그랜저 IG AGM80L", "그랜저 IG AGM95L", "그랜저 IG 방전"],
    preferred: ["grandeur-ig-agm80l", "agm80l-standard", "slow-engine-start"],
  },
  {
    match: ["셀토스", "seltos"],
    intent: "셀토스 AGM 호환",
    headline: "셀토스 ISG 트림은 AGM60L·AGM70L 업그레이드를 검토하세요",
    summary: "AGM60L 순정 대비 AGM70L 용량업 문의가 많습니다. 공간·CCA를 확인하세요.",
    confidence: "93%",
    related: ["셀토스 AGM60L", "셀토스 AGM70L", "셀토스 ISG"],
    preferred: ["seltos-agm60l", "agm80l-standard", "slow-engine-start"],
  },
  {
    match: ["쏘렌토", "mq4", "sorento"],
    intent: "차종별 AGM 호환성",
    headline: "쏘렌토 MQ4에는 AGM95L 후보를 우선 확인하세요",
    summary: "ISG/IBS 적용 트림은 일반 MF보다 AGM/EFB 순정 규격 유지가 안정적입니다.",
    confidence: "98%",
    related: ["쏘렌토 MQ4 AGM95L", "쏘렌토 MQ4 IBS 초기화", "쏘렌토 하이브리드 배터리"],
    preferred: ["sorento-mq4-agm95l", "agm80l-standard", "slow-engine-start"],
  },
  {
    match: ["ev6", "12v", "전기차"],
    intent: "EV 12V 보조배터리 진단",
    headline: "EV6 12V 방전은 교체 전 재방전 패턴 진단이 중요합니다",
    summary: "보조배터리 SOH와 주차 대기 전류, 충전 제어 로그를 같이 보는 결과를 우선 표시합니다.",
    confidence: "91%",
    related: ["EV6 12V 방전", "아이오닉5 12V 배터리", "EV 보조배터리 SOH"],
    preferred: ["ev6-12v-drain", "blackbox-drain", "winter-cca"],
  },
  {
    match: ["agm80", "agm", "80l"],
    intent: "배터리 모델/규격 검색",
    headline: "AGM80L은 차종별 Ah/CCA와 터미널 방향 확인이 필요합니다",
    summary: "AGM 규격 후보와 호환 차종, BMS 충전 제어 조건을 함께 보여드립니다.",
    confidence: "96%",
    related: ["AGM80L 호환 차종", "AGM 배터리 일반 배터리 차이", "그랜저 GN7 AGM80L"],
    preferred: ["agm80l-standard", "sorento-mq4-agm95l", "winter-cca"],
  },
  {
    match: ["시동", "늦", "딸깍", "안걸"],
    intent: "증상 기반 원인 진단",
    headline: "시동 지연은 CCA/SOH 저하 신호를 먼저 확인하세요",
    summary: "증상 키워드가 감지되어 전압, CCA, 주행 충전 패턴 기반의 문제 카드를 우선 정렬했습니다.",
    confidence: "94%",
    related: ["시동 늦게 걸림", "겨울철 시동 지연", "CCA 부족 증상"],
    preferred: ["slow-engine-start", "winter-cca", "agm80l-standard"],
  },
];

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function assetResultsForQuery(query: string): BatterySearchResult[] {
  return searchVehicleAssets(query, 8).map((asset) => ({
    id: `asset-${asset.id}`,
    type: "vehicles" as const,
    title: asset.displayName,
    subtitle: [asset.generationName, asset.defaultBatteryCode].filter(Boolean).join(" · ") || asset.modelGroup,
    summary: asset.batteryNotes ?? `${asset.displayName} 배터리 규격 확인`,
    score: "차종 매칭",
    href: vehicleAssetHref(asset),
    badges: [...(asset.tags ?? []), vehicleAssetBrandLabel(asset.brand)].slice(0, 4),
    metrics: [
      ["연식", asset.yearRange ?? "-"],
      ["배터리", asset.defaultBatteryCode ?? "확인"],
    ],
    filters: asset.tags?.includes("EV") ? (["ev12v"] as SearchFilter[]) : (["agm"] as SearchFilter[]),
  }));
}

function buildHref(query: string, tab: SearchTab, filter: SearchFilter) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (tab !== "all") params.set("tab", tab);
  if (filter !== "all") params.set("filter", filter);
  return `/search?${params.toString()}`;
}

export function getSearchHref(query: string, tab: SearchTab = "all", filter: SearchFilter = "all") {
  return buildHref(query, tab, filter);
}

export function getSearchExperience(
  queryValue?: string,
  tab: SearchTab = "all",
  filter: SearchFilter = "all",
): SearchExperience {
  const query = queryValue?.trim() || defaultQuery;
  const normalizedQuery = normalize(query);
  const scenario =
    scenarios.find((item) => item.match.some((keyword) => normalizedQuery.includes(keyword))) ??
    scenarios[0];

  const preferred = scenario.preferred
    .map((id) => searchResults.find((result) => result.id === id))
    .filter((result): result is BatterySearchResult => Boolean(result));

  const assetMatches = queryValue?.trim() ? assetResultsForQuery(query) : [];

  const ordered = [
    ...assetMatches,
    ...preferred,
    ...searchResults.filter((result) => !scenario.preferred.includes(result.id)),
  ];

  const dedupedOrdered = ordered.filter(
    (result, index, arr) => arr.findIndex((item) => item.href === result.href) === index,
  );

  const results = dedupedOrdered.filter((result) => {
    const matchesTab = tab === "all" || result.type === tab;
    const matchesFilter = filter === "all" || result.filters.includes(filter);
    return matchesTab && matchesFilter;
  });

  const tabs: SearchExperience["tabs"] = [
    { id: "all", label: "전체", count: dedupedOrdered.length },
    { id: "vehicles", label: "차량", count: dedupedOrdered.filter((result) => result.type === "vehicles").length },
    { id: "problems", label: "증상", count: dedupedOrdered.filter((result) => result.type === "problems").length },
    { id: "batteries", label: "배터리", count: dedupedOrdered.filter((result) => result.type === "batteries").length },
    { id: "guides", label: "가이드", count: dedupedOrdered.filter((result) => result.type === "guides").length },
  ];

  return {
    query,
    intent: scenario.intent,
    headline: scenario.headline,
    summary: scenario.summary,
    confidence: scenario.confidence,
    tabs,
    filters: searchFilters,
    related: scenario.related,
    results,
  };
}
