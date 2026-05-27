import type { Page } from "@playwright/test";
import { generateCustomerFeedback } from "./customerFeedback";
import { enrichIssues, maxSeverity, toFinalStatus } from "./issueDetails";
import { executeJourney, vehicleLabelFromPersona } from "./journeyRunner";
import { collectPageObservation } from "./observation";
import { ScreenshotBudget } from "./screenshotBudget";
import type { FinalStatus, PageObservation, Persona, ScenarioResult, Severity, UxIssue } from "./types";
import { collectPageMetrics, resultStatus, runUxRules } from "./uxRules";

const MOBILE_VIEWPORT = { width: 390, height: 844 };
const DESKTOP_VIEWPORT = { width: 1280, height: 720 };

function emptyObservation(url = ""): PageObservation {
  return {
    pageTitle: "",
    pageUrl: url,
    topVisibleTextSample: "",
    fullPageTextSample: "",
    visibleHeadings: [],
    visibleButtons: [],
    visibleCardsSummary: [],
  };
}

function emptyMetrics(viewportHeight: number) {
  return {
    scrollHeight: 0,
    viewportHeight,
    scrollRatio: 0,
    visibleCardCount: 0,
    brokenImageCount: 0,
    badgeMaxInCard: 0,
    foldTextLength: 0,
    keywordHitsAboveFold: 0,
    devTermHits: [] as string[],
    ctaHits: [] as string[],
    bodyText: "",
    foldText: "",
  };
}

function buildScenarioResult(
  persona: Persona,
  opts: {
    startedAt: string;
    endedAt: string;
    durationMs: number;
    viewport: { width: number; height: number };
    vehicleLabel: string;
    url: string;
    stepsLog: ScenarioResult["stepsLog"];
    visitedUrls: string[];
    observation: ScenarioResult["pageObservation"];
    metrics: ReturnType<typeof emptyMetrics>;
    issues: ScenarioResult["issues"];
    status: ScenarioResult["status"];
    finalStatus: FinalStatus;
    severity: Severity;
    error?: string;
    feedback: ReturnType<typeof generateCustomerFeedback>;
  },
): ScenarioResult {
  return {
    scenarioId: persona.id,
    personaId: persona.id,
    personaName: persona.personaName,
    personaType: persona.personaType,
    ageGroup: persona.ageGroup,
    personality: persona.personality,
    knowledgeLevel: persona.knowledgeLevel,
    urgency: persona.urgency,
    device: persona.device,
    viewport: opts.viewport,
    vehicle: { ...persona.vehicle },
    situation: persona.situation,
    journeyType: persona.journeyType,
    startBehavior: persona.startBehavior,
    goal: persona.goal,
    query: persona.query,
    expectedKeywords: [...persona.expectedKeywords],
    startedAt: opts.startedAt,
    endedAt: opts.endedAt,
    durationMs: opts.durationMs,
    finalStatus: opts.finalStatus,
    severity: opts.severity,
    vehicleLabel: opts.vehicleLabel,
    batterySpec: persona.batterySpec,
    url: opts.url,
    stepsLog: opts.stepsLog,
    pageObservation: opts.observation,
    actualVisibleTextSample: opts.observation.topVisibleTextSample.slice(0, 500),
    visitedUrls: opts.visitedUrls,
    status: opts.status,
    issues: opts.issues,
    metrics: {
      scrollHeight: opts.metrics.scrollHeight,
      viewportHeight: opts.metrics.viewportHeight,
      scrollRatio: opts.metrics.scrollRatio,
      visibleCardCount: opts.metrics.visibleCardCount,
      brokenImageCount: opts.metrics.brokenImageCount,
      badgeMaxInCard: opts.metrics.badgeMaxInCard,
      foldTextLength: opts.metrics.foldTextLength,
      keywordHitsAboveFold: opts.metrics.keywordHitsAboveFold,
      devTermHits: opts.metrics.devTermHits,
      ctaHits: opts.metrics.ctaHits,
    },
    error: opts.error,
    ...opts.feedback,
  };
}

export async function runScenario(
  page: Page,
  persona: Persona,
  screenshotBudget: ScreenshotBudget,
): Promise<ScenarioResult> {
  const startedAt = new Date().toISOString();
  const started = Date.now();
  const viewport = persona.device === "mobile" ? MOBILE_VIEWPORT : DESKTOP_VIEWPORT;
  await page.setViewportSize(viewport);

  const vehicleLabel = vehicleLabelFromPersona(persona);
  let error: string | undefined;
  let journeyResult = {
    finalUrl: "",
    visitedUrls: [] as string[],
    stepErrors: [] as string[],
    stepsLog: [] as ScenarioResult["stepsLog"],
  };

  try {
    journeyResult = await executeJourney(page, persona);
    if (journeyResult.stepErrors.length > 0 && !journeyResult.finalUrl) {
      error = journeyResult.stepErrors[0];
    }
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  let metrics = emptyMetrics(viewport.height);
  let observation: PageObservation = emptyObservation(page.url());
  let rawIssues: UxIssue[] = [];

  try {
    metrics = await collectPageMetrics(page);
    observation = await collectPageObservation(page);
    if (!error) {
      rawIssues = runUxRules(persona, metrics, page.url(), journeyResult);
    }
  } catch (e) {
    error = error ?? (e instanceof Error ? e.message : String(e));
  }

  const status = resultStatus(rawIssues, error);
  const screenshotPaths = new Map<string, string>();

  for (const issue of rawIssues) {
    if (issue.severity === "HIGH") {
      const step =
        [...journeyResult.stepsLog].reverse().find((s) => !s.success)?.step ?? journeyResult.stepsLog.length;
      const shot = await screenshotBudget.capture(page, persona.id, issue.rule, step);
      if (shot) screenshotPaths.set(issue.rule, shot);
    }
  }

  const issues = enrichIssues(rawIssues, persona, vehicleLabel, journeyResult.stepsLog, observation, metrics, screenshotPaths);
  const severity = issues.length ? maxSeverity(issues) : ("LOW" as Severity);
  const finalStatus = error ? "FAIL" : toFinalStatus(status);
  const feedback = generateCustomerFeedback(persona, issues, metrics, finalStatus, error);

  return buildScenarioResult(persona, {
    startedAt,
    endedAt: new Date().toISOString(),
    durationMs: Date.now() - started,
    viewport,
    vehicleLabel,
    url: page.url(),
    stepsLog: journeyResult.stepsLog,
    visitedUrls: journeyResult.visitedUrls,
    observation,
    metrics,
    issues,
    status,
    finalStatus,
    severity,
    error,
    feedback,
  });
}

export async function runAuditBatch(page: Page, personas: Persona[]): Promise<ScenarioResult[]> {
  const screenshotBudget = new ScreenshotBudget();
  const results: ScenarioResult[] = [];

  for (const persona of personas) {
    try {
      results.push(await runScenario(page, persona, screenshotBudget));
    } catch (e) {
      const viewport = persona.device === "mobile" ? MOBILE_VIEWPORT : DESKTOP_VIEWPORT;
      const vehicleLabel = vehicleLabelFromPersona(persona);
      const now = new Date().toISOString();
      const feedback = generateCustomerFeedback(
        persona,
        [],
        emptyMetrics(viewport.height),
        "FAIL",
        e instanceof Error ? e.message : String(e),
      );
      results.push(
        buildScenarioResult(persona, {
          startedAt: now,
          endedAt: now,
          durationMs: 0,
          viewport,
          vehicleLabel,
          url: "",
          stepsLog: [],
          visitedUrls: [],
          observation: emptyObservation(),
          metrics: emptyMetrics(viewport.height),
          issues: [],
          status: "fail",
          finalStatus: "FAIL",
          severity: "HIGH",
          error: e instanceof Error ? e.message : String(e),
          feedback,
        }),
      );
    }
  }

  return results;
}

export { getRunMode } from "./config";
