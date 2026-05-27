import type { Page } from "@playwright/test";
import { getBaseUrl } from "./config";
import type { JourneyStep, Persona, StepLogEntry } from "./types";

export type JourneyRunResult = {
  finalUrl: string;
  visitedUrls: string[];
  stepErrors: string[];
  stepsLog: StepLogEntry[];
};

async function getPageTitle(page: Page): Promise<string> {
  try {
    return await page.title();
  } catch {
    return "";
  }
}

async function clickByTexts(page: Page, texts: string[]): Promise<boolean> {
  for (const text of texts) {
    const link = page.getByRole("link", { name: new RegExp(text, "i") }).first();
    if (await link.count()) {
      try {
        await link.click({ timeout: 5000 });
        return true;
      } catch {
        /* try next */
      }
    }
    const button = page.getByRole("button", { name: new RegExp(text, "i") }).first();
    if (await button.count()) {
      try {
        await button.click({ timeout: 5000 });
        return true;
      } catch {
        /* try next */
      }
    }
    const any = page.locator(`a, button`).filter({ hasText: new RegExp(text, "i") }).first();
    if (await any.count()) {
      try {
        await any.click({ timeout: 5000 });
        return true;
      } catch {
        /* try next */
      }
    }
  }
  return false;
}

async function runSearch(page: Page, base: string, query: string): Promise<void> {
  if (!query.trim()) return;

  const searchInput = page.locator('input[type="search"], input[placeholder*="검색"], input[name="q"]').first();
  if (await searchInput.count()) {
    try {
      await searchInput.fill(query);
      await searchInput.press("Enter");
      await page.waitForLoadState("domcontentloaded", { timeout: 15000 }).catch(() => undefined);
      return;
    } catch {
      /* fallback */
    }
  }

  await page.goto(`${base}/search?q=${encodeURIComponent(query)}`, {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });
}

function stepTarget(step: JourneyStep): string | string[] {
  switch (step.action) {
    case "goto":
      return step.url;
    case "search":
      return step.query;
    case "clickLink":
    case "findAndClickAny":
      return step.textIncludes;
    case "scroll":
      return `scroll ${step.amount ?? 600}px`;
    case "expectTopResult":
      return step.keywords;
    case "expectAnyCta":
      return step.texts;
    case "expectAnyText":
      return step.textIncludes;
  }
}

async function evaluateExpectStep(page: Page, step: JourneyStep): Promise<{ success: boolean; notes: string }> {
  const bodyText = await page.evaluate(() => document.body.innerText ?? "");
  const foldText = bodyText.slice(0, 1200);
  const upper = foldText.toUpperCase();

  switch (step.action) {
    case "expectTopResult": {
      const hits = step.keywords.filter((k) => upper.includes(k.toUpperCase()));
      const success = hits.length >= Math.min(2, step.keywords.length);
      return {
        success,
        notes: success
          ? `상단 영역에서 기대 키워드 ${hits.join(", ")} 확인`
          : `상단 1200px 안에 기대 키워드(${step.keywords.join(", ")})가 충분히 보이지 않음 (발견: ${hits.join(", ") || "없음"})`,
      };
    }
    case "expectAnyCta": {
      const found = step.texts.filter((t) => bodyText.includes(t));
      const success = found.length > 0;
      return {
        success,
        notes: success
          ? `CTA 확인: ${found.join(", ")}`
          : `기대 CTA(${step.texts.join(", ")})가 페이지에서 발견되지 않음`,
      };
    }
    case "expectAnyText": {
      const found = step.textIncludes.filter((t) => bodyText.includes(t));
      const success = found.length > 0;
      return {
        success,
        notes: success
          ? `기대 텍스트 확인: ${found.join(", ")}`
          : `기대 텍스트(${step.textIncludes.join(", ")})가 보이지 않음`,
      };
    }
    default:
      return { success: true, notes: "" };
  }
}

export async function executeJourney(page: Page, persona: Persona): Promise<JourneyRunResult> {
  const base = getBaseUrl().replace(/\/$/, "");
  const visitedUrls: string[] = [];
  const stepErrors: string[] = [];
  const stepsLog: StepLogEntry[] = [];
  let stepNum = 0;

  for (const step of persona.steps) {
    stepNum++;
    let success = true;
    let notes = "";
    const target = stepTarget(step);

    try {
      switch (step.action) {
        case "goto":
          await page.goto(`${base}${step.url}`, { waitUntil: "domcontentloaded", timeout: 30000 });
          notes = step.url === "/" ? "메인페이지 정상 진입" : `${step.url} 페이지 진입`;
          break;
        case "search":
          if (persona.startBehavior === "검색창부터 사용" && step.query) {
            await page.goto(`${base}/`, { waitUntil: "domcontentloaded", timeout: 30000 });
            await runSearch(page, base, step.query);
            notes = "검색창에 입력 후 검색 결과 페이지로 이동";
          } else if (step.query) {
            await page.goto(`${base}/search?q=${encodeURIComponent(step.query)}`, {
              waitUntil: "domcontentloaded",
              timeout: 30000,
            });
            notes = "검색 결과 페이지로 직접 이동";
          }
          break;
        case "clickLink":
        case "findAndClickAny": {
          const clicked = await clickByTexts(page, step.textIncludes);
          if (!clicked) {
            success = false;
            notes = `클릭 실패 — ${step.textIncludes.join(" / ")} 링크·버튼을 찾지 못함`;
            stepErrors.push(notes);
            const fallback = fallbackUrl(step.textIncludes);
            if (fallback) {
              await page.goto(`${base}${fallback}`, { waitUntil: "domcontentloaded", timeout: 30000 });
              notes += ` → 대체 경로 ${fallback} 로 이동`;
            }
          } else {
            await page.waitForLoadState("domcontentloaded", { timeout: 15000 }).catch(() => undefined);
            notes = `${step.textIncludes[0]} 관련 링크 클릭`;
          }
          break;
        }
        case "scroll":
          await page.evaluate((amount) => window.scrollBy(0, amount ?? 600), step.amount ?? 600);
          notes = `페이지 ${step.amount ?? 600}px 스크롤`;
          break;
        case "expectTopResult":
        case "expectAnyCta":
        case "expectAnyText": {
          const evalResult = await evaluateExpectStep(page, step);
          success = evalResult.success;
          notes = evalResult.notes;
          break;
        }
      }
      await page.waitForTimeout(350);
      visitedUrls.push(page.url());
    } catch (e) {
      success = false;
      notes = e instanceof Error ? e.message : String(e);
      stepErrors.push(notes);
    }

    stepsLog.push({
      step: stepNum,
      action: step.action,
      target,
      urlAfterAction: page.url(),
      success,
      visibleTitle: await getPageTitle(page),
      notes: notes || `${step.action} 실행`,
    });
  }

  return {
    finalUrl: page.url(),
    visitedUrls: [...new Set(visitedUrls)],
    stepErrors,
    stepsLog,
  };
}

function fallbackUrl(texts: string[]): string | null {
  const joined = texts.join(" ");
  if (/차종|차량/.test(joined)) return "/vehicles";
  if (/규격|AGM|비교/.test(joined)) return "/compare";
  if (/증상|시동|방전|진단/.test(joined)) return "/diagnosis";
  if (/사진/.test(joined)) return "/analysis/photo";
  if (/Q&A|FAQ|질문/.test(joined)) return "/community";
  if (/쇼핑|주문|택배/.test(joined)) return "/shop";
  if (/정비|매장|작업|서비스/.test(joined)) return "/service-center";
  if (/가이드/.test(joined)) return "/guides";
  return null;
}

export function vehicleLabelFromPersona(persona: Persona): string {
  const { vehicle } = persona;
  const base = `${vehicle.brand} ${vehicle.model}`;
  const gen = vehicle.generation && !vehicle.model.includes(vehicle.generation) ? ` ${vehicle.generation}` : "";
  return `${base}${gen} ${vehicle.year} ${vehicle.fuel}`.replace(/\s+/g, " ").trim();
}

export function fullVehicleLabel(persona: Persona): string {
  return vehicleLabelFromPersona(persona);
}
