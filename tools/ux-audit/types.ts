export type KnowledgeLevel = "beginner" | "normal" | "advanced";
export type Urgency = "low" | "normal" | "high";
export type Device = "desktop" | "mobile";
export type Severity = "HIGH" | "MEDIUM" | "LOW";
export type ScenarioStatus = "pass" | "warn" | "fail";

export type AgeGroup = "20대" | "30대" | "40대" | "50대" | "60대";

export type Personality =
  | "급한 사람"
  | "꼼꼼한 사람"
  | "가격 비교형"
  | "차를 잘 모르는 사람"
  | "정비 지식 있는 사람"
  | "모바일로 대충 보는 사람"
  | "신뢰 확인형"
  | "구매 직전형"
  | "문의 전 확인형";

export type JourneyType =
  | "direct_search"
  | "browse_vehicle"
  | "browse_spec"
  | "compare_battery"
  | "symptom_check"
  | "photo_check"
  | "faq_browse"
  | "shop_order_check"
  | "repair_shop_search"
  | "trust_check";

export type StartBehavior =
  | "검색창부터 사용"
  | "메인 카드 클릭"
  | "사이드바 클릭"
  | "FAQ부터 확인"
  | "규격표부터 확인"
  | "사진 확인 버튼 찾기"
  | "정비소/매장 찾기"
  | "여러 페이지 둘러보기";

export type PersonaVehicle = {
  brand: string;
  model: string;
  generation: string;
  year: string;
  fuel: string;
};

export type JourneyStep =
  | { action: "goto"; url: string }
  | { action: "search"; query: string }
  | { action: "clickLink"; textIncludes: string[] }
  | { action: "findAndClickAny"; textIncludes: string[] }
  | { action: "scroll"; amount?: number }
  | { action: "expectTopResult"; keywords: string[] }
  | { action: "expectAnyCta"; texts: string[] }
  | { action: "expectAnyText"; textIncludes: string[] };

export type Persona = {
  id: string;
  personaName: string;
  /** 리포트 호환용 — journeyType 기반 라벨 */
  personaType: string;
  ageGroup: AgeGroup;
  knowledgeLevel: KnowledgeLevel;
  urgency: Urgency;
  personality: Personality;
  vehicle: PersonaVehicle;
  situation: string;
  journeyType: JourneyType;
  startBehavior: StartBehavior;
  query: string;
  goal: string;
  steps: JourneyStep[];
  expectedKeywords: string[];
  expectedCtas: string[];
  possibleFrustrations: string[];
  device: Device;
  severityWeight: Severity;
  /** 주 배터리 규격 (리포트 집계용) */
  batterySpec?: string;
  /** @deprecated journey runner가 steps를 우선 사용 */
  actionType?: "search" | "direct" | "photo" | "diagnosis" | "community" | "home";
  directPath?: string;
};

export type UxIssueContext = {
  query: string;
  expectedKeywords: string[];
  groupLabel: string;
  journeyType?: JourneyType;
  personality?: Personality;
  vehicleLabel?: string;
  batterySpec?: string;
};

export type UserSentiment = "very_negative" | "negative" | "neutral" | "positive";

export type NextActionLikelihood = "low" | "medium" | "high";

export type FinalStatus = "PASS" | "WARNING" | "FAIL";

export type ViewportInfo = { width: number; height: number };

export type StepLogEntry = {
  step: number;
  action: string;
  target: string | string[];
  urlAfterAction: string;
  success: boolean;
  visibleTitle?: string;
  notes: string;
};

export type PageObservation = {
  pageTitle: string;
  pageUrl: string;
  topVisibleTextSample: string;
  fullPageTextSample: string;
  visibleHeadings: string[];
  visibleButtons: string[];
  visibleCardsSummary: string[];
};

export type DetailedIssue = {
  issueId: string;
  issueType: string;
  severity: Severity;
  pageUrl: string;
  pageTitle: string;
  journeyType: JourneyType;
  personaName: string;
  vehicleLabel: string;
  query: string;
  actionBeforeIssue: string;
  expected: string;
  actual: string;
  evidence: string;
  likelyUserFrustration: string;
  suggestedFix: string;
  relatedText: string[];
  screenshotPath?: string;
  topVisibleTextSample: string;
  visibleCtas: string[];
  visibleCardsCount: number;
  unrelatedResultsCount: number;
  scrollHeightRatio: number;
};

export type UxIssue = {
  rule: string;
  severity: Severity;
  message: string;
  suggestion?: string;
  context?: UxIssueContext;
  actionBeforeIssue?: string;
};

export type ScenarioMetrics = {
  scrollHeight: number;
  viewportHeight: number;
  scrollRatio: number;
  visibleCardCount: number;
  brokenImageCount: number;
  badgeMaxInCard: number;
  foldTextLength: number;
  keywordHitsAboveFold: number;
  devTermHits: string[];
  ctaHits: string[];
};

export type ScenarioResult = {
  scenarioId: string;
  personaId: string;
  personaName: string;
  personaType: string;
  ageGroup: AgeGroup;
  personality: Personality;
  knowledgeLevel: KnowledgeLevel;
  urgency: Urgency;
  device: Device;
  viewport: ViewportInfo;
  vehicle: PersonaVehicle;
  situation: string;
  journeyType: JourneyType;
  startBehavior: StartBehavior;
  goal: string;
  query: string;
  expectedKeywords: string[];
  startedAt: string;
  endedAt: string;
  durationMs: number;
  finalStatus: FinalStatus;
  severity: Severity;
  vehicleLabel: string;
  batterySpec?: string;
  url: string;
  stepsLog: StepLogEntry[];
  pageObservation: PageObservation;
  actualVisibleTextSample: string;
  visitedUrls: string[];
  status: ScenarioStatus;
  issues: DetailedIssue[];
  metrics: ScenarioMetrics;
  error?: string;
  userRating: number;
  userSentiment: UserSentiment;
  userComment: string;
  frustrationTags: string[];
  trustScore: number;
  nextActionLikelihood: NextActionLikelihood;
};

export type AuditRunMode = "QUICK" | "DEFAULT" | "FULL";

export type AuditReport = {
  executedAt: string;
  baseUrl: string;
  runMode: AuditRunMode;
  totalPersonasGenerated: number;
  executedCount: number;
  executedPersonaIds: string[];
  results: ScenarioResult[];
  summary: {
    pass: number;
    warn: number;
    fail: number;
    high: number;
    medium: number;
    low: number;
  };
};

export const JOURNEY_TYPE_LABELS: Record<JourneyType, string> = {
  direct_search: "검색형",
  browse_vehicle: "차종 탐색형",
  browse_spec: "규격 탐색형",
  compare_battery: "배터리 비교형",
  symptom_check: "증상 확인형",
  photo_check: "사진 확인형",
  faq_browse: "FAQ 탐색형",
  shop_order_check: "주문/배송 확인형",
  repair_shop_search: "정비소/매장 찾기형",
  trust_check: "신뢰 확인형",
};

export const JOURNEY_RATIOS: Record<JourneyType, number> = {
  direct_search: 0.3,
  browse_vehicle: 0.15,
  browse_spec: 0.1,
  compare_battery: 0.1,
  symptom_check: 0.1,
  photo_check: 0.07,
  faq_browse: 0.05,
  shop_order_check: 0.05,
  repair_shop_search: 0.05,
  trust_check: 0.03,
};
