#!/usr/bin/env npx tsx
/**
 * Battery Manager — 고객 여정 감사 (Playwright)
 * 고객 화면/로직 수정 없음. 캡처·리포트만 생성.
 *
 * Usage:
 *   BASE_URL=http://localhost:3000 npm run audit:journey
 *   BASE_URL=https://www.batterymanager.co.kr npm run audit:journey
 */
import { chromium, type Browser, type BrowserContext, type Page } from "@playwright/test";
import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const BASE_URL = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");

const PC_VIEWPORT = { width: 1440, height: 1200, deviceScaleFactor: 1 };
const MOBILE_VIEWPORT = {
  width: 390,
  height: 844,
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
};

const DANGEROUS_KEYWORDS = [
  "결제하기",
  "결제",
  "주문 완료",
  "저장",
  "삭제",
  "발송",
  "환불",
  "승인",
  "취소 처리",
  "회원가입 완료",
  "가입 완료",
  "로그인",
  "관리자 저장",
  "업로드",
  "수정 완료",
  "제출",
];

const FORBIDDEN_VISIBLE_TEXT = [
  "build",
  "env",
  "admin",
  "audit",
  "debug",
  "route",
  "localhost",
  "인증 연동 후 제공됩니다",
  "개발",
  "임시",
  "TODO",
  "FIXME",
  "mock",
  "dummy",
  "혜택을 불러오는 중",
];

/** 자동완성 등 — 복수 허용 경로 (예: "/vehicle/ 또는 /batteries/") */
function matchesExpectedDestination(
  actualUrl: string,
  expected: string,
  baseUrl: string,
): boolean {
  if (!expected?.trim()) return true;
  const actualPath = actualUrl.replace(baseUrl, "").split("?")[0] ?? actualUrl;

  if (expected.includes(" 또는 ")) {
    const candidates = expected
      .split(" 또는 ")
      .map((s) => s.trim())
      .filter(Boolean);
    return candidates.some((c) => {
      const path = c.startsWith("/") ? c : `/${c}`;
      return actualPath.startsWith(path) || actualPath.includes(path.replace(/^\//, ""));
    });
  }

  const exp = expected.startsWith("http")
    ? expected
    : `${baseUrl}${expected.startsWith("/") ? expected : `/${expected}`}`;
  const expPath = exp.replace(baseUrl, "").split("?")[0]!;
  return (
    actualUrl.startsWith(exp.split("?")[0]!) ||
    actualUrl === exp ||
    actualPath.startsWith(expPath)
  );
}

function photoInquiryLocator(page: Page) {
  return page
    .getByRole("link", { name: /사진으로|사진 확인|사진 문의|사진 상담/ })
    .or(page.getByRole("button", { name: /사진으로|사진 확인|사진 문의|사진 상담/ }));
}

type ViewportName = "pc" | "mobile";
type ResultType =
  | "ok"
  | "same-page-opened"
  | "modal-opened"
  | "drawer-opened"
  | "wrong-destination"
  | "no-response"
  | "error"
  | "skipped-dangerous-action"
  | "auth-blocked"
  | "page-visit"
  | "input"
  | "tab"
  | "hover"
  | "cart-empty"
  | "issue";

type JourneyStep = {
  journeyName: string;
  stepNumber: number;
  pageName: string;
  viewport: ViewportName;
  fromUrl: string;
  actionType: string;
  targetText: string;
  targetSelector: string;
  expectedDestination: string;
  actualDestination: string;
  resultType: ResultType;
  beforeScreenshot: string;
  afterScreenshot: string;
  notes: string;
  consoleErrors: string[];
  failedRequests: string[];
  httpStatusIssues: string[];
};

type ClickableElement = {
  pageUrl: string;
  viewport: ViewportName;
  tag: string;
  text: string;
  ariaLabel: string;
  href: string;
  disabled: boolean;
  selector: string;
};

type PageIssue = {
  url: string;
  viewport: ViewportName;
  forbiddenHits: string[];
};

// ---------------------------------------------------------------------------
// Run directory
// ---------------------------------------------------------------------------

function runStamp(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
}

function tryGitHash(): string {
  try {
    return execSync("git rev-parse HEAD", { cwd: ROOT, encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

// ---------------------------------------------------------------------------
// Audit context
// ---------------------------------------------------------------------------

class JourneyAuditContext {
  readonly runDir: string;
  readonly steps: JourneyStep[] = [];
  readonly clickables: ClickableElement[] = [];
  readonly skippedPaths: { path: string; reason: string }[] = [];
  readonly pageIssues: PageIssue[] = [];
  readonly startedAt = new Date().toISOString();
  readonly gitHash = tryGitHash();
  shotCounter = 0;
  private stepCounter = 0;
  buildStamp = "";

  constructor(readonly baseUrl: string) {
    const stamp = runStamp();
    this.runDir = join(ROOT, "design-audit", "journey-runs", stamp);
    mkdirSync(join(this.runDir, "screenshots", "pc"), { recursive: true });
    mkdirSync(join(this.runDir, "screenshots", "mobile"), { recursive: true });
  }

  nextStepNumber(): number {
    this.stepCounter += 1;
    return this.stepCounter;
  }

  private nextFilename(slug: string, viewport: ViewportName): string {
    this.shotCounter += 1;
    const num = String(this.shotCounter).padStart(3, "0");
    const safe = slug.replace(/[^a-zA-Z0-9가-힣_-]+/g, "-").slice(0, 60);
    return `${num}-${safe}.png`;
  }

  async screenshot(page: Page, viewport: ViewportName, slug: string): Promise<string> {
    const file = this.nextFilename(slug, viewport);
    const full = join(this.runDir, "screenshots", viewport, file);
    await page.screenshot({ path: full, fullPage: true, type: "png" });
    return `screenshots/${viewport}/${file}`;
  }

  isDangerous(text: string): boolean {
    const t = text.trim();
    if (!t) return false;
    return DANGEROUS_KEYWORDS.some((kw) => t.includes(kw));
  }

  attachListeners(page: Page, bucket: {
    consoleErrors: string[];
    failedRequests: string[];
    httpStatusIssues: string[];
  }) {
    page.on("console", (msg) => {
      if (msg.type() === "error") bucket.consoleErrors.push(msg.text().slice(0, 300));
    });
    page.on("pageerror", (err) => {
      bucket.consoleErrors.push(`pageerror: ${String(err.message).slice(0, 300)}`);
    });
    page.on("requestfailed", (req) => {
      bucket.failedRequests.push(`${req.method()} ${req.url()} — ${req.failure()?.errorText ?? "failed"}`);
    });
    page.on("response", (res) => {
      const s = res.status();
      if (s >= 400) bucket.httpStatusIssues.push(`${s} ${res.url()}`);
    });
  }

  async stabilize(page: Page) {
    await page.waitForLoadState("domcontentloaded").catch(() => {});
    await page.waitForLoadState("networkidle", { timeout: 12_000 }).catch(() => {});
    await page.waitForTimeout(1000);
  }

  async goto(page: Page, path: string): Promise<number | null> {
    const url = path.startsWith("http") ? path : `${this.baseUrl}${path}`;
    const res = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45_000 }).catch(() => null);
    await this.stabilize(page);
    if (!this.buildStamp) {
      const html = await page.content();
      this.buildStamp =
        html.match(/data-build-version="([^"]+)"/)?.[1] ??
        html.match(/v\s*(BM-[A-Z0-9-]+)/i)?.[1] ??
        "";
    }
    return res?.status() ?? null;
  }

  async pathExists(path: string): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}${path}`, { method: "HEAD", redirect: "follow" });
      return res.status < 400;
    } catch {
      return false;
    }
  }

  async resolveFirstExisting(paths: string[]): Promise<string | null> {
    for (const p of paths) {
      if (await this.pathExists(p)) return p;
    }
    return null;
  }

  pushStep(step: JourneyStep) {
    this.steps.push(step);
  }

  async scanForbidden(page: Page, viewport: ViewportName) {
    try {
      const text = await page.locator("body").innerText();
      const lower = text.toLowerCase();
      const hits = FORBIDDEN_VISIBLE_TEXT.filter((w) => lower.includes(w.toLowerCase()));
      if (hits.length) {
        this.pageIssues.push({ url: page.url(), viewport, forbiddenHits: hits });
      }
    } catch {
      /* ignore */
    }
  }

  async scanCheckoutGuestIssues(page: Page, viewport: ViewportName) {
    try {
      if (!page.url().includes("/checkout")) return;
      const text = await page.locator("body").innerText();
      const isGuestCheckout =
        text.includes("비회원 주문") || text.includes("비회원으로도 주문할 수 있습니다");
      if (!isGuestCheckout) return;

      const guestMemberButtons = ["회원정보와 동일", "기본 배송지 불러오기"].filter((label) =>
        text.includes(label),
      );
      if (guestMemberButtons.length) {
        this.pushStep({
          journeyName: "H. 주문/결제",
          stepNumber: this.nextStepNumber(),
          pageName: "checkout-guest-ui",
          viewport,
          fromUrl: page.url(),
          actionType: "scan",
          targetText: "비회원 checkout 회원정보 버튼",
          targetSelector: "checkout-member-apply",
          expectedDestination: "비회원 화면에서 숨김",
          actualDestination: page.url(),
          resultType: "issue",
          beforeScreenshot: "",
          afterScreenshot: "",
          notes: `비회원 checkout에 회원 전용 버튼 노출: ${guestMemberButtons.join(", ")}`,
          consoleErrors: [],
          failedRequests: [],
          httpStatusIssues: [],
        });
      }
    } catch {
      /* ignore */
    }
  }

  async discoverClickables(page: Page, viewport: ViewportName) {
    const items = await page.evaluate(() => {
      const out: {
        tag: string;
        text: string;
        ariaLabel: string;
        href: string;
        disabled: boolean;
        selector: string;
      }[] = [];
      const sel =
        'a[href], button, [role="button"], [role="tab"], input[type="submit"]';
      document.querySelectorAll(sel).forEach((el, idx) => {
        const rect = el.getBoundingClientRect();
        if (rect.width < 2 || rect.height < 2) return;
        const style = getComputedStyle(el);
        if (style.display === "none" || style.visibility === "hidden") return;
        const tag = el.tagName.toLowerCase();
        const text = (el.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 120);
        const ariaLabel = el.getAttribute("aria-label") ?? "";
        const href = el instanceof HTMLAnchorElement ? el.href : "";
        const disabled =
          el.hasAttribute("disabled") ||
          el.getAttribute("aria-disabled") === "true";
        out.push({
          tag,
          text,
          ariaLabel,
          href,
          disabled,
          selector: `${tag}[data-audit-idx="${idx}"]`,
        });
      });
      return out;
    });
    for (const it of items) {
      this.clickables.push({ pageUrl: page.url(), viewport, ...it });
    }
  }

  async recordPageVisit(
    page: Page,
    viewport: ViewportName,
    journeyName: string,
    pageName: string,
    path: string,
    notes = "",
  ): Promise<boolean> {
    const bucket = { consoleErrors: [] as string[], failedRequests: [] as string[], httpStatusIssues: [] as string[] };
    this.attachListeners(page, bucket);
    const status = await this.goto(page, path);
    if (status === 404 || status === 500) {
      this.skippedPaths.push({ path, reason: `HTTP ${status}` });
      return false;
    }
    await this.scanForbidden(page, viewport);
    await this.discoverClickables(page, viewport);
    const shot = await this.screenshot(page, viewport, `${journeyName}-visit-${pageName}`);
    this.pushStep({
      journeyName,
      stepNumber: this.nextStepNumber(),
      pageName,
      viewport,
      fromUrl: page.url(),
      actionType: "page-visit",
      targetText: pageName,
      targetSelector: path,
      expectedDestination: path,
      actualDestination: page.url(),
      resultType: status && status >= 400 ? "error" : "page-visit",
      beforeScreenshot: shot,
      afterScreenshot: shot,
      notes: notes || `페이지 접속 (${path})`,
      consoleErrors: [...bucket.consoleErrors],
      failedRequests: [...bucket.failedRequests],
      httpStatusIssues: [...bucket.httpStatusIssues],
    });
    return true;
  }

  async recordInteraction(
    page: Page,
    viewport: ViewportName,
    opts: {
      journeyName: string;
      pageName: string;
      actionType: string;
      locator: ReturnType<Page["locator"]>;
      targetText: string;
      targetSelector: string;
      expectedDestination: string;
      allowDangerous?: boolean;
      /** 네비게이션 링크 등 — '로그인' 텍스트여도 클릭 허용 */
      forceClick?: boolean;
      hoverOnly?: boolean;
      notes?: string;
    },
  ): Promise<ResultType> {
    const bucket = { consoleErrors: [] as string[], failedRequests: [] as string[], httpStatusIssues: [] as string[] };
    this.attachListeners(page, bucket);
    const fromUrl = page.url();
    const label = opts.targetText || opts.targetSelector;
    const before = await this.screenshot(
      page,
      viewport,
      `${opts.journeyName}-before-${label}`,
    );

    let resultType: ResultType = "no-response";
    let actualDestination = fromUrl;
    let notes = opts.notes ?? "";

    if (!opts.allowDangerous && !opts.forceClick && this.isDangerous(opts.targetText)) {
      resultType = "skipped-dangerous-action";
      notes = `위험 키워드로 클릭 생략: ${opts.targetText}`;
    } else if (opts.hoverOnly) {
      try {
        await opts.locator.first().hover({ timeout: 5000 });
        resultType = "same-page-opened";
        notes = "hover만 수행 (외부 인증/전화 등 방지)";
      } catch (e) {
        resultType = "error";
        notes = `hover 실패: ${String(e)}`;
      }
    } else {
      try {
        const visible = await opts.locator.first().isVisible({ timeout: 8000 }).catch(() => false);
        if (!visible) {
          resultType = "no-response";
          notes = "요소가 보이지 않음";
        } else {
          await opts.locator.first().click({ timeout: 8000 });
          await this.stabilize(page);
          actualDestination = page.url();
          if (actualDestination === fromUrl) {
            resultType = "same-page-opened";
          } else if (
            opts.expectedDestination &&
            !matchesExpectedDestination(actualDestination, opts.expectedDestination, this.baseUrl)
          ) {
            resultType = "wrong-destination";
            notes = `예상: ${opts.expectedDestination}, 실제: ${actualDestination}`;
          } else {
            resultType = "ok";
          }
        }
      } catch (e) {
        resultType = "error";
        notes = `클릭 실패: ${String(e)}`;
      }
    }

    const after = await this.screenshot(page, viewport, `${opts.journeyName}-after-${label}`);
    this.pushStep({
      journeyName: opts.journeyName,
      stepNumber: this.nextStepNumber(),
      pageName: opts.pageName,
      viewport,
      fromUrl,
      actionType: opts.actionType,
      targetText: opts.targetText,
      targetSelector: opts.targetSelector,
      expectedDestination: opts.expectedDestination,
      actualDestination,
      resultType,
      beforeScreenshot: before,
      afterScreenshot: after,
      notes,
      consoleErrors: [...bucket.consoleErrors],
      failedRequests: [...bucket.failedRequests],
      httpStatusIssues: [...bucket.httpStatusIssues],
    });
    return resultType;
  }

  async recordSearchFlow(
    page: Page,
    viewport: ViewportName,
    journeyName: string,
    startPath: string,
    query: string,
  ) {
    await this.recordPageVisit(page, viewport, journeyName, "검색 시작", startPath);
    const input = page.locator('input[role="combobox"], input[name="q"], input[type="search"]').first();
    const hasSearch = await input.isVisible({ timeout: 8000 }).catch(() => false);
    if (!hasSearch) {
      this.skippedPaths.push({ path: startPath, reason: `검색창 없음 (${journeyName}: ${query})` });
      return;
    }
    await input.click({ timeout: 8000 }).catch(() => {});
    await this.recordInteraction(page, viewport, {
      journeyName,
      pageName: "검색",
      actionType: "click",
      locator: input,
      targetText: "검색창",
      targetSelector: 'input[role="combobox"]',
      expectedDestination: startPath,
      notes: "검색창 포커스",
    });
    await input.fill(query, { timeout: 10_000 }).catch(() => {
      this.skippedPaths.push({ path: startPath, reason: `검색어 입력 실패: ${query}` });
    });
    await page.waitForTimeout(800);
    const autoShot = await this.screenshot(page, viewport, `${journeyName}-autocomplete-${query}`);
    this.pushStep({
      journeyName,
      stepNumber: this.nextStepNumber(),
      pageName: "검색",
      viewport,
      fromUrl: page.url(),
      actionType: "input",
      targetText: query,
      targetSelector: 'input[role="combobox"]',
      expectedDestination: "자동완성 표시",
      actualDestination: page.url(),
      resultType: "input",
      beforeScreenshot: autoShot,
      afterScreenshot: autoShot,
      notes: `검색어 입력: ${query}`,
      consoleErrors: [],
      failedRequests: [],
      httpStatusIssues: [],
    });

    const firstOption = page.locator('[id^="bm-search-option-"], [role="option"]').first();
    if (await firstOption.isVisible({ timeout: 3000 }).catch(() => false)) {
      await this.recordInteraction(page, viewport, {
        journeyName,
        pageName: "검색 결과",
        actionType: "click",
        locator: firstOption,
        targetText: "첫 자동완성 항목",
        targetSelector: "[role=option]",
        expectedDestination: "/vehicle/ 또는 /batteries/ 또는 /search",
        notes: "자동완성 첫 항목 클릭",
      });
    } else {
      await input.press("Enter");
      await this.stabilize(page);
      const resultShot = await this.screenshot(page, viewport, `${journeyName}-search-enter-${query}`);
      this.pushStep({
        journeyName,
        stepNumber: this.nextStepNumber(),
        pageName: "검색 결과",
        viewport,
        fromUrl: page.url(),
        actionType: "input",
        targetText: `${query} + Enter`,
        targetSelector: "Enter",
        expectedDestination: "/search",
        actualDestination: page.url(),
        resultType: page.url().includes("/search") ? "ok" : "wrong-destination",
        beforeScreenshot: resultShot,
        afterScreenshot: resultShot,
        notes: "Enter 검색 후 결과 페이지",
        consoleErrors: [],
        failedRequests: [],
        httpStatusIssues: [],
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Journeys
// ---------------------------------------------------------------------------

async function journeyFirstVisit(ctx: JourneyAuditContext, page: Page, viewport: ViewportName) {
  const J = "A. 첫 방문 고객";
  await ctx.recordPageVisit(page, viewport, J, "홈", "/");

  const mobileNav = page.getByRole("navigation", { name: "모바일 메뉴" });
  if (viewport === "mobile" && (await mobileNav.isVisible().catch(() => false))) {
    await ctx.recordInteraction(page, viewport, {
      journeyName: J,
      pageName: "홈",
      actionType: "open",
      locator: mobileNav,
      targetText: "모바일 메뉴",
      targetSelector: "nav[aria-label=모바일 메뉴]",
      expectedDestination: "/",
      notes: "모바일 가로 메뉴 영역 캡처",
    });
  }

  const searchInput = page.locator('input[role="combobox"]').first();
  if (await searchInput.isVisible().catch(() => false)) {
    await ctx.recordInteraction(page, viewport, {
      journeyName: J,
      pageName: "홈",
      actionType: "click",
      locator: searchInput,
      targetText: "메인 검색창",
      targetSelector: 'input[role="combobox"]',
      expectedDestination: "/",
    });
  }

  const ctaTexts = [
    "차종검색",
    "혜택",
    "리뷰",
    "고객센터",
    "매장·출장 안내",
    "로그인",
    "회원가입",
  ];
  for (const text of ctaTexts) {
    const link = page.getByRole("link", { name: new RegExp(text) }).first();
    if (await link.isVisible().catch(() => false)) {
      await ctx.recordInteraction(page, viewport, {
        journeyName: J,
        pageName: "홈 헤더/CTA",
        actionType: "click",
        locator: link,
        targetText: text,
        targetSelector: `link:${text}`,
        expectedDestination: "/",
        forceClick: text === "로그인" || text === "회원가입",
      });
      await ctx.goto(page, "/");
    }
  }

  for (const item of ["점검·관리 팁", "증상 진단", "Q&A"]) {
    const quick = page.getByRole("link", { name: new RegExp(item) }).first();
    if (await quick.isVisible().catch(() => false)) {
      await ctx.recordInteraction(page, viewport, {
        journeyName: J,
        pageName: "홈 빠른 메뉴",
        actionType: "click",
        locator: quick,
        targetText: item,
        targetSelector: `quick:${item}`,
        expectedDestination: "/",
      });
      await ctx.goto(page, "/");
    }
  }
}

async function journeyVehicleSearch(ctx: JourneyAuditContext, page: Page, viewport: ViewportName) {
  const J = "B. 차량 검색";
  const queries = ["싼타페", "포터2", "AGM70L"];
  for (const q of queries) {
    await ctx.recordSearchFlow(page, viewport, `${J} (${q})`, "/", q);
    const ctas = ["주문하기", "배터리 규격 보기", "리뷰 보기", "사진으로"];
    for (const cta of ctas) {
      const btn = page.getByRole("link", { name: new RegExp(cta) }).or(page.getByRole("button", { name: new RegExp(cta) }));
      if (await btn.first().isVisible().catch(() => false)) {
        await ctx.recordInteraction(page, viewport, {
          journeyName: J,
          pageName: "차량/검색 상세",
          actionType: "click",
          locator: btn.first(),
          targetText: cta,
          targetSelector: cta,
          expectedDestination: "/",
        });
      }
    }
  }
}

async function journeyBatterySearch(ctx: JourneyAuditContext, page: Page, viewport: ViewportName) {
  const J = "C. 배터리 규격 검색";
  const codes = ["AGM60L", "AGM70L", "AGM80L", "AGM95L", "DIN74L"];
  for (const code of codes) {
    const path = await ctx.resolveFirstExisting([`/batteries/${code}`, `/battery-specs/${code}`]);
    if (!path) {
      ctx.skippedPaths.push({ path: `/batteries/${code}`, reason: "404" });
      continue;
    }
    await ctx.recordPageVisit(page, viewport, J, `배터리 ${code}`, path);
    for (const cta of ["주문하기", "장바구니", "비교", "사진"]) {
      const el =
        cta === "사진"
          ? photoInquiryLocator(page)
          : page
              .getByRole("link", { name: new RegExp(cta) })
              .or(page.getByRole("button", { name: new RegExp(cta) }));
      if (await el.first().isVisible().catch(() => false)) {
        await ctx.recordInteraction(page, viewport, {
          journeyName: J,
          pageName: path,
          actionType: "click",
          locator: el.first(),
          targetText: cta,
          targetSelector: cta,
          expectedDestination: "/",
        });
        await ctx.goto(page, path);
      }
    }
  }
}

async function journeyBrandCards(ctx: JourneyAuditContext, page: Page, viewport: ViewportName) {
  const J = "D. 브랜드/상품 카드";
  await ctx.goto(page, "/");
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
  await page.waitForTimeout(500);

  const typeTabs = ["AGM", "DIN", "일반형"];
  for (const tab of typeTabs) {
    const btn = page.getByRole("tab", { name: tab }).first();
    if (await btn.isVisible().catch(() => false)) {
      await ctx.recordInteraction(page, viewport, {
        journeyName: J,
        pageName: "홈 브랜드 라인업",
        actionType: "tab",
        locator: btn,
        targetText: tab,
        targetSelector: `tab:${tab}`,
        expectedDestination: "/",
      });
    }
  }

  for (const cta of ["리뷰 보기", "배터리 규격 보기", "주문하기"]) {
    const link = page.getByRole("link", { name: cta }).first();
    if (await link.isVisible().catch(() => false)) {
      await ctx.recordInteraction(page, viewport, {
        journeyName: J,
        pageName: "상품 카드",
        actionType: "click",
        locator: link,
        targetText: cta,
        targetSelector: cta,
        expectedDestination: "/",
      });
      await ctx.goto(page, "/");
      await page.evaluate(() => window.scrollTo(0, 800));
      await page.waitForTimeout(400);
    }
  }
}

async function journeySignup(ctx: JourneyAuditContext, page: Page, viewport: ViewportName) {
  const J = "E. 회원가입";
  if (!(await ctx.recordPageVisit(page, viewport, J, "회원가입", "/signup"))) return;

  await page.getByPlaceholder("아이디").fill("audittest01");
  await page.getByPlaceholder("8자 이상").first().fill("Test1234!");
  await page.getByPlaceholder("010-0000-0000").fill("01012345678");
  await page.getByPlaceholder("example@email.com").fill("test@example.com");
  const filled = await ctx.screenshot(page, viewport, `${J}-filled`);
  ctx.pushStep({
    journeyName: J,
    stepNumber: ctx.nextStepNumber(),
    pageName: "회원가입",
    viewport,
    fromUrl: page.url(),
    actionType: "input",
    targetText: "테스트 입력값",
    targetSelector: "signup-form",
    expectedDestination: "/signup",
    actualDestination: page.url(),
    resultType: "input",
    beforeScreenshot: filled,
    afterScreenshot: filled,
    notes: "이름/연락처/이메일/비밀번호 입력 후 (제출 안 함)",
    consoleErrors: [],
    failedRequests: [],
    httpStatusIssues: [],
  });

  for (const social of ["네이버", "카카오", "Google"]) {
    const btn = page.getByRole("link", { name: new RegExp(social) });
    if (await btn.first().isVisible().catch(() => false)) {
      await ctx.recordInteraction(page, viewport, {
        journeyName: J,
        pageName: "회원가입",
        actionType: "hover",
        locator: btn.first(),
        targetText: `${social} 로그인`,
        targetSelector: `oauth:${social}`,
        expectedDestination: "/signup",
        hoverOnly: true,
      });
    }
  }

  const submit = page.getByRole("button", { name: /회원가입|가입 완료/ });
  if (await submit.first().isVisible().catch(() => false)) {
    await ctx.recordInteraction(page, viewport, {
      journeyName: J,
      pageName: "회원가입",
      actionType: "click",
      locator: submit.first(),
      targetText: "회원가입 완료 버튼",
      targetSelector: "button:signup",
      expectedDestination: "/signup",
      notes: "제출 버튼 — 클릭 생략 (skipped-dangerous-action)",
    });
  }
}

async function journeyLogin(ctx: JourneyAuditContext, page: Page, viewport: ViewportName) {
  const J = "F. 로그인";
  await ctx.recordPageVisit(page, viewport, J, "로그인", "/login");

  for (const social of ["네이버", "카카오", "Google"]) {
    const btn = page.getByRole("link", { name: new RegExp(social) });
    if (await btn.first().isVisible().catch(() => false)) {
      await ctx.recordInteraction(page, viewport, {
        journeyName: J,
        pageName: "로그인",
        actionType: "hover",
        locator: btn.first(),
        targetText: `${social} 로그인`,
        targetSelector: `oauth:${social}`,
        expectedDestination: "/login",
        hoverOnly: true,
      });
    }
  }

  const signupLink = page.getByRole("link", { name: /회원가입/ }).first();
  if (await signupLink.isVisible().catch(() => false)) {
    await ctx.recordInteraction(page, viewport, {
      journeyName: J,
      pageName: "로그인",
      actionType: "click",
      locator: signupLink,
      targetText: "회원가입",
      targetSelector: "link:signup",
      expectedDestination: "/signup",
    });
  }

  const forgot = page.getByRole("link", { name: /비밀번호/ }).first();
  if (await forgot.isVisible().catch(() => false)) {
    await ctx.recordInteraction(page, viewport, {
      journeyName: J,
      pageName: "로그인",
      actionType: "click",
      locator: forgot,
      targetText: "비밀번호 찾기",
      targetSelector: "link:forgot",
      expectedDestination: "/",
    });
  }
}

async function journeyVehicleRegister(ctx: JourneyAuditContext, page: Page, viewport: ViewportName) {
  const J = "G. 차량정보 등록";
  const path = await ctx.resolveFirstExisting(["/vehicles?register=1", "/mypage", "/vehicles"]);
  if (!path) {
    ctx.skippedPaths.push({ path: "/vehicles?register=1", reason: "not found" });
    return;
  }
  await ctx.recordPageVisit(page, viewport, J, "차량 등록", path);
  const searchOnPage = page.locator('input[role="combobox"], input[name="q"], input[type="search"]').first();
  if (await searchOnPage.isVisible({ timeout: 5000 }).catch(() => false)) {
    await ctx.recordSearchFlow(page, viewport, J, path, "싼타페 TM");
  } else {
    await ctx.recordSearchFlow(page, viewport, J, "/", "싼타페 TM");
  }
}

async function journeyCartAdd(ctx: JourneyAuditContext, page: Page, viewport: ViewportName) {
  const J = "L. 장바구니 담기";
  const batteryPath = await ctx.resolveFirstExisting(["/batteries/AGM70L", "/battery-specs/AGM70L"]);
  if (!batteryPath) {
    ctx.skippedPaths.push({ path: "/batteries/AGM70L", reason: "장바구니 검수용 배터리 404" });
    return;
  }

  await ctx.recordPageVisit(page, viewport, J, "배터리 AGM70L", batteryPath);

  const addBtn = page.getByRole("button", { name: /장바구니 담기/ });
  if (!(await addBtn.first().isVisible({ timeout: 8000 }).catch(() => false))) {
    ctx.pushStep({
      journeyName: J,
      stepNumber: ctx.nextStepNumber(),
      pageName: batteryPath,
      viewport,
      fromUrl: page.url(),
      actionType: "click",
      targetText: "장바구니 담기",
      targetSelector: "button:장바구니 담기",
      expectedDestination: "/cart",
      actualDestination: page.url(),
      resultType: "no-response",
      beforeScreenshot: "",
      afterScreenshot: "",
      notes: "장바구니 담기 버튼 없음",
      consoleErrors: [],
      failedRequests: [],
      httpStatusIssues: [],
    });
    return;
  }

  await addBtn.first().click({ timeout: 8000 });
  await page.waitForTimeout(600);

  const modalCartLink = page.getByRole("link", { name: /장바구니 보기/ });
  if (await modalCartLink.first().isVisible({ timeout: 3000 }).catch(() => false)) {
    await modalCartLink.first().click({ timeout: 8000 });
  } else {
    await ctx.goto(page, "/cart");
  }
  await ctx.stabilize(page);

  const shot = await ctx.screenshot(page, viewport, `${J}-cart-contents`);
  const bodyText = await page.locator("body").innerText().catch(() => "");
  const isEmpty =
    (await page.locator("[data-cart-empty]").isVisible().catch(() => false)) ||
    bodyText.includes("장바구니가 비어 있습니다");
  const hasProduct = /AGM70L|제품 구매가|출장 교체가|담긴 상품/.test(bodyText);

  ctx.pushStep({
    journeyName: J,
    stepNumber: ctx.nextStepNumber(),
    pageName: "/cart",
    viewport,
    fromUrl: batteryPath,
    actionType: "verify",
    targetText: "장바구니 상품 표시",
    targetSelector: "[data-cart-item], [data-cart-empty]",
    expectedDestination: "AGM70L 상품 표시",
    actualDestination: page.url(),
    resultType: isEmpty || !hasProduct ? "cart-empty" : "ok",
    beforeScreenshot: shot,
    afterScreenshot: shot,
    notes: isEmpty || !hasProduct ? "장바구니 담기 후 /cart 비어 있음" : `장바구니 상품 확인: ${bodyText.slice(0, 120)}`,
    consoleErrors: [],
    failedRequests: [],
    httpStatusIssues: [],
  });
}

async function journeyCheckout(ctx: JourneyAuditContext, page: Page, viewport: ViewportName) {
  const J = "H. 주문/결제";
  const batteryPath = await ctx.resolveFirstExisting(["/batteries/AGM70L", "/battery-specs/AGM70L"]);
  if (!batteryPath) {
    ctx.skippedPaths.push({ path: "/batteries/AGM70L", reason: "404" });
    return;
  }
  await ctx.goto(page, batteryPath);
  const orderBtn = page.getByRole("link", { name: "주문하기" }).or(page.getByRole("button", { name: "주문하기" }));
  if (await orderBtn.first().isVisible().catch(() => false)) {
    await ctx.recordInteraction(page, viewport, {
      journeyName: J,
      pageName: batteryPath,
      actionType: "click",
      locator: orderBtn.first(),
      targetText: "주문하기",
      targetSelector: "주문하기",
      expectedDestination: "/checkout",
    });
  } else {
    await ctx.recordPageVisit(page, viewport, J, "주문서", "/checkout");
  }

  const checkoutPath = await ctx.resolveFirstExisting(["/checkout", "/cart"]);
  if (page.url().includes("/checkout") || checkoutPath) {
    if (!page.url().includes("/checkout") && checkoutPath) await ctx.goto(page, checkoutPath);
    await ctx.recordPageVisit(page, viewport, J, "주문/결제 폼", page.url());
    await ctx.scanCheckoutGuestIssues(page, viewport);

    const methods = page.locator(".checkout-fulfillment-card, button.checkout-fulfillment-card");
    const count = await methods.count();
    for (let i = 0; i < Math.min(count, 4); i++) {
      const card = methods.nth(i);
      const text = (await card.innerText().catch(() => "")).slice(0, 40);
      await ctx.recordInteraction(page, viewport, {
        journeyName: J,
        pageName: "주문서",
        actionType: "click",
        locator: card,
        targetText: text || `수령방식 ${i + 1}`,
        targetSelector: `.checkout-fulfillment-card:nth(${i})`,
        expectedDestination: "/checkout",
      });
    }

    const payBtn = page.getByRole("button", { name: /결제/ });
    if (await payBtn.first().isVisible().catch(() => false)) {
      await ctx.recordInteraction(page, viewport, {
        journeyName: J,
        pageName: "주문서",
        actionType: "click",
        locator: payBtn.first(),
        targetText: "결제하기",
        targetSelector: "button:pay",
        expectedDestination: "/checkout",
        notes: "결제 버튼 — 클릭 생략",
      });
    }
  }
}

async function journeyPhotoInquiry(ctx: JourneyAuditContext, page: Page, viewport: ViewportName) {
  const J = "I. 사진 확인/문의";
  for (const path of ["/photo-check", "/order-request", "/support", "/analysis/photo"]) {
    if (await ctx.pathExists(path)) {
      await ctx.recordPageVisit(page, viewport, J, path, path);
    } else {
      ctx.skippedPaths.push({ path, reason: "404" });
    }
  }
}

async function journeyStores(ctx: JourneyAuditContext, page: Page, viewport: ViewportName) {
  const J = "J. 지점/출장/서비스";
  for (const path of ["/service-center", "/service"]) {
    if (!(await ctx.pathExists(path))) {
      ctx.skippedPaths.push({ path, reason: "404" });
      continue;
    }
    await ctx.recordPageVisit(page, viewport, J, path, path);

    for (const store of ["덕천", "학장"]) {
      const card = page.getByRole("link", { name: new RegExp(store) }).or(page.getByText(new RegExp(`${store}점`)));
      if (await card.first().isVisible().catch(() => false)) {
        await ctx.recordInteraction(page, viewport, {
          journeyName: J,
          pageName: path,
          actionType: "click",
          locator: card.first(),
          targetText: `${store}점`,
          targetSelector: `store:${store}`,
          expectedDestination: path,
        });
      }
    }

    const telLinks = await page.locator('a[href^="tel:"]').all();
    for (const tel of telLinks.slice(0, 3)) {
      const href = (await tel.getAttribute("href")) ?? "";
      ctx.pushStep({
        journeyName: J,
        stepNumber: ctx.nextStepNumber(),
        pageName: path,
        viewport,
        fromUrl: page.url(),
        actionType: "record-only",
        targetText: "전화 링크",
        targetSelector: href,
        expectedDestination: href,
        actualDestination: href,
        resultType: "skipped-dangerous-action",
        beforeScreenshot: "",
        afterScreenshot: "",
        notes: `전화 버튼 href만 기록 (클릭 안 함): ${href}`,
        consoleErrors: [],
        failedRequests: [],
        httpStatusIssues: [],
      });
    }
  }
}

async function journeyAdmin(ctx: JourneyAuditContext, page: Page, viewport: ViewportName) {
  const J = "K. 관리자 접근";
  for (const path of ["/admin", "/admin/products", "/admin/orders", "/admin/promotions"]) {
    await ctx.goto(page, path);
    const url = page.url();
    const isLogin = url.includes("/admin/login") || (await page.getByText(/관리자 로그인|인증/).isVisible().catch(() => false));
    const shot = await ctx.screenshot(page, viewport, `${J}-${path.replace(/\//g, "-")}`);
    ctx.pushStep({
      journeyName: J,
      stepNumber: ctx.nextStepNumber(),
      pageName: path,
      viewport,
      fromUrl: url,
      actionType: "page-visit",
      targetText: path,
      targetSelector: path,
      expectedDestination: path,
      actualDestination: url,
      resultType: isLogin ? "auth-blocked" : "page-visit",
      beforeScreenshot: shot,
      afterScreenshot: shot,
      notes: isLogin ? "관리자 인증 필요" : "관리자 첫 화면",
      consoleErrors: [],
      failedRequests: [],
      httpStatusIssues: [],
    });
  }
}

async function runJourneySafe(
  ctx: JourneyAuditContext,
  page: Page,
  viewport: ViewportName,
  name: string,
  fn: () => Promise<void>,
) {
  try {
    await fn();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.warn(`  ⚠ ${name} [${viewport}] — ${msg.slice(0, 120)}`);
    const shot = await ctx.screenshot(page, viewport, `error-${name}`).catch(() => "");
    ctx.pushStep({
      journeyName: name,
      stepNumber: ctx.nextStepNumber(),
      pageName: page.url(),
      viewport,
      fromUrl: page.url(),
      actionType: "error",
      targetText: name,
      targetSelector: "",
      expectedDestination: "",
      actualDestination: page.url(),
      resultType: "error",
      beforeScreenshot: shot,
      afterScreenshot: shot,
      notes: msg.slice(0, 500),
      consoleErrors: [msg],
      failedRequests: [],
      httpStatusIssues: [],
    });
  }
}

async function runAllJourneys(ctx: JourneyAuditContext, viewport: ViewportName) {
  const browser = await chromium.launch({ headless: true });
  const vpConfig =
    viewport === "pc"
      ? { viewport: PC_VIEWPORT, userAgent: undefined }
      : { viewport: MOBILE_VIEWPORT, userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15" };

  const context = await browser.newContext({
    ...vpConfig,
    locale: "ko-KR",
  });
  const page = await context.newPage();

  try {
    await runJourneySafe(ctx, page, viewport, "A. 첫 방문 고객", () => journeyFirstVisit(ctx, page, viewport));
    await runJourneySafe(ctx, page, viewport, "B. 차량 검색", () => journeyVehicleSearch(ctx, page, viewport));
    await runJourneySafe(ctx, page, viewport, "C. 배터리 규격 검색", () => journeyBatterySearch(ctx, page, viewport));
    await runJourneySafe(ctx, page, viewport, "D. 브랜드/상품 카드", () => journeyBrandCards(ctx, page, viewport));
    await runJourneySafe(ctx, page, viewport, "E. 회원가입", () => journeySignup(ctx, page, viewport));
    await runJourneySafe(ctx, page, viewport, "F. 로그인", () => journeyLogin(ctx, page, viewport));
    await runJourneySafe(ctx, page, viewport, "G. 차량정보 등록", () => journeyVehicleRegister(ctx, page, viewport));
    await runJourneySafe(ctx, page, viewport, "H. 주문/결제", () => journeyCheckout(ctx, page, viewport));
    await runJourneySafe(ctx, page, viewport, "L. 장바구니 담기", () => journeyCartAdd(ctx, page, viewport));
    await runJourneySafe(ctx, page, viewport, "I. 사진 확인/문의", () => journeyPhotoInquiry(ctx, page, viewport));
    await runJourneySafe(ctx, page, viewport, "J. 지점/출장/서비스", () => journeyStores(ctx, page, viewport));
    await runJourneySafe(ctx, page, viewport, "K. 관리자 접근", () => journeyAdmin(ctx, page, viewport));

    const extraPaths = [
      ["/search", "검색"],
      ["/compare", "비교"],
      ["/benefits", "혜택"],
      ["/reviews", "리뷰"],
      ["/orders/lookup", "주문조회"],
      ["/cart", "장바구니"],
    ] as const;
    for (const [p, name] of extraPaths) {
      if (await ctx.pathExists(p)) {
        await ctx.recordPageVisit(page, viewport, "추가 주요 페이지", name, p);
        if (p === "/benefits") await ctx.scanForbidden(page, viewport);
      }
    }

    const vehicleSlugs = [
      "/vehicle/grandeur-ig",
      "/vehicle/sorento-mq4",
      "/vehicle/santafe-mx5",
      "/vehicle/hyundai-grandeur-ig",
    ];
    for (const slug of vehicleSlugs) {
      if (await ctx.pathExists(slug)) {
        await ctx.recordPageVisit(page, viewport, "차량 상세", slug, slug);
      } else {
        ctx.skippedPaths.push({ path: slug, reason: "404" });
      }
    }
  } finally {
    await context.close();
    await browser.close();
  }
}

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function generateIndexHtml(ctx: JourneyAuditContext): string {
  const journeys = [...new Set(ctx.steps.map((s) => s.journeyName))];
  const okClicks = ctx.steps.filter((s) => s.resultType === "ok").length;
  const wrong = ctx.steps.filter((s) => s.resultType === "wrong-destination").length;
  const noResp = ctx.steps.filter((s) => s.resultType === "no-response").length;
  const skipped = ctx.steps.filter((s) => s.resultType === "skipped-dangerous-action").length;
  const errors = ctx.steps.filter((s) => s.resultType === "error").length;
  const shots = ctx.steps.filter((s) => s.beforeScreenshot || s.afterScreenshot).length;

  let sections = "";
  for (const jn of journeys) {
    const jSteps = ctx.steps.filter((s) => s.journeyName === jn);
    const grouped = new Map<string, JourneyStep[]>();
    for (const s of jSteps) {
      const key = `${s.stepNumber}-${s.targetText}-${s.actionType}`;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(s);
    }

    sections += `<section class="journey"><h2>${esc(jn)}</h2>`;
    for (const [, group] of grouped) {
      const ref = group[0]!;
      sections += `<div class="step"><h3>Step ${ref.stepNumber} — ${esc(ref.targetText)}</h3>`;
      sections += `<table class="meta"><tr><th>Action</th><td>${esc(ref.actionType)}</td></tr>`;
      sections += `<tr><th>From</th><td>${esc(ref.fromUrl)}</td></tr>`;
      sections += `<tr><th>Expected</th><td>${esc(ref.expectedDestination)}</td></tr>`;
      sections += `<tr><th>Result</th><td>${esc(group.map((g) => `${g.viewport}:${g.resultType} → ${g.actualDestination}`).join("<br>"))}</td></tr>`;
      if (ref.notes) sections += `<tr><th>Notes</th><td>${esc(ref.notes)}</td></tr></table>`;

      sections += `<div class="shots">`;
      for (const vp of ["pc", "mobile"] as ViewportName[]) {
        const st = group.find((g) => g.viewport === vp);
        if (!st) continue;
        sections += `<div class="vp"><h4>${vp.toUpperCase()}</h4>`;
        if (st.beforeScreenshot) {
          sections += `<figure><a href="${st.beforeScreenshot}" target="_blank"><img src="${st.beforeScreenshot}" alt="before" loading="lazy"/></a>`;
          sections += `<figcaption>클릭 전 — ${esc(st.beforeScreenshot)}</figcaption></figure>`;
        }
        if (st.afterScreenshot && st.afterScreenshot !== st.beforeScreenshot) {
          sections += `<figure><a href="${st.afterScreenshot}" target="_blank"><img src="${st.afterScreenshot}" alt="after" loading="lazy"/></a>`;
          sections += `<figcaption>클릭 후 — ${esc(st.afterScreenshot)}</figcaption></figure>`;
        }
        const errs = [...st.consoleErrors, ...st.failedRequests, ...st.httpStatusIssues];
        if (errs.length) {
          sections += `<pre class="err">${esc(errs.slice(0, 5).join("\n"))}</pre>`;
        }
        sections += `</div>`;
      }
      sections += `</div></div>`;
    }
    sections += `</section>`;
  }

  return `<!DOCTYPE html>
<html lang="ko"><head><meta charset="utf-8"/><title>고객 여정 감사 — ${esc(ctx.startedAt)}</title>
<style>
body{font-family:system-ui,sans-serif;margin:0;padding:24px;background:#f8fafc;color:#0f172a}
.summary{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin-bottom:24px}
.journey{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin-bottom:24px}
.step{border-top:1px solid #e2e8f0;padding-top:16px;margin-top:16px}
.shots{display:flex;flex-wrap:wrap;gap:16px}
.vp{flex:1;min-width:280px}
figure{margin:0 0 12px}
img{max-width:100%;height:auto;border:1px solid #cbd5e1;border-radius:8px;cursor:zoom-in}
figcaption{font-size:11px;color:#64748b;margin-top:4px}
.meta{font-size:12px;width:100%;border-collapse:collapse;margin:8px 0}
.meta th{text-align:left;padding:4px 8px;background:#f1f5f9;width:100px}
.err{font-size:10px;background:#fef2f2;color:#991b1b;padding:8px;border-radius:6px;overflow:auto}
</style></head><body>
<div class="summary"><h1>고객 여정 감사</h1>
<p><strong>실행</strong> ${esc(ctx.startedAt)}</p>
<p><strong>BASE_URL</strong> ${esc(ctx.baseUrl)}</p>
<p><strong>commit</strong> ${esc(ctx.gitHash)}</p>
<p><strong>build</strong> ${esc(ctx.buildStamp || "—")}</p>
<ul>
<li>총 여정: ${journeys.length}</li>
<li>총 단계: ${ctx.steps.length}</li>
<li>캡처 참조: ${shots}</li>
<li>성공 클릭: ${okClicks}</li>
<li>잘못된 이동: ${wrong}</li>
<li>반응 없음: ${noResp}</li>
<li>스킵/위험: ${skipped}</li>
<li>오류: ${errors}</li>
</ul></div>
${sections}
</body></html>`;
}

function generateReportMd(ctx: JourneyAuditContext): string {
  const lines: string[] = [];
  lines.push("# 고객 여정 감사 report.md");
  lines.push("");
  lines.push("## 1. 실행 정보");
  lines.push(`- 실행 일시: ${ctx.startedAt}`);
  lines.push(`- BASE_URL: ${ctx.baseUrl}`);
  lines.push(`- commit: ${ctx.gitHash}`);
  lines.push(`- build stamp: ${ctx.buildStamp || "—"}`);
  lines.push("");
  lines.push("## 2. 여정별 결과 요약");
  for (const jn of [...new Set(ctx.steps.map((s) => s.journeyName))]) {
    const js = ctx.steps.filter((s) => s.journeyName === jn);
    lines.push(`### ${jn}`);
    lines.push(`- 단계 수: ${js.length}`);
    lines.push(`- 성공: ${js.filter((s) => s.resultType === "ok").length}`);
    lines.push(`- 잘못된 이동: ${js.filter((s) => s.resultType === "wrong-destination").length}`);
    lines.push("");
  }
  lines.push("## 3. 클릭 단계 상세");
  lines.push("| Journey | Step | VP | Action | Target | Expected | Actual | Result | Before | After |");
  lines.push("|---------|------|-----|--------|--------|----------|--------|--------|--------|-------|");
  for (const s of ctx.steps) {
    lines.push(
      `| ${s.journeyName} | ${s.stepNumber} | ${s.viewport} | ${s.actionType} | ${s.targetText.replace(/\|/g, "/")} | ${s.expectedDestination} | ${s.actualDestination} | ${s.resultType} | ${s.beforeScreenshot} | ${s.afterScreenshot} |`,
    );
  }
  lines.push("");
  lines.push("## 4. 스킵 경로");
  for (const sk of ctx.skippedPaths) {
    lines.push(`- ${sk.path}: ${sk.reason}`);
  }
  lines.push("");
  lines.push("## 5. 장바구니 검수");
  const cartSteps = ctx.steps.filter((s) => s.journeyName === "L. 장바구니 담기" && s.actionType === "verify");
  if (cartSteps.length === 0) {
    lines.push("- 장바구니 검수 단계 없음");
  } else {
    for (const s of cartSteps) {
      lines.push(`- [${s.viewport}] ${s.resultType}: ${s.notes}`);
    }
  }
  lines.push("");
  lines.push("## 6. 잘못된 이동");
  for (const s of ctx.steps.filter((x) => x.resultType === "wrong-destination")) {
    lines.push(`- [${s.viewport}] ${s.journeyName} step ${s.stepNumber}: ${s.targetText} — expected ${s.expectedDestination}, got ${s.actualDestination}`);
  }
  lines.push("");
  lines.push("## 7. 반응 없음");
  for (const s of ctx.steps.filter((x) => x.resultType === "no-response")) {
    lines.push(`- [${s.viewport}] ${s.targetText} @ ${s.fromUrl}`);
  }
  lines.push("");
  lines.push("## 8. auth 차단");
  for (const s of ctx.steps.filter((x) => x.resultType === "auth-blocked")) {
    lines.push(`- [${s.viewport}] ${s.actualDestination}`);
  }
  lines.push("");
  lines.push("## 9. 위험 클릭 스킵");
  for (const s of ctx.steps.filter((x) => x.resultType === "skipped-dangerous-action")) {
    lines.push(`- [${s.viewport}] ${s.targetText}: ${s.notes}`);
  }
  lines.push("");
  lines.push("## 10. 오류 (console / request / HTTP)");
  for (const s of ctx.steps) {
    const errs = [...s.consoleErrors, ...s.failedRequests, ...s.httpStatusIssues];
    if (errs.length) {
      lines.push(`### ${s.journeyName} step ${s.stepNumber} [${s.viewport}]`);
      for (const e of errs.slice(0, 10)) lines.push(`- ${e}`);
    }
  }
  lines.push("");
  lines.push("## 11. 금지 문구 후보");
  for (const pi of ctx.pageIssues) {
    lines.push(`- [${pi.viewport}] ${pi.url}: ${pi.forbiddenHits.join(", ")}`);
  }
  lines.push("");
  lines.push("## 12. 클릭 가능 요소 샘플 (페이지별)");
  const byPage = new Map<string, ClickableElement[]>();
  for (const c of ctx.clickables) {
    const k = `${c.viewport}::${c.pageUrl}`;
    if (!byPage.has(k)) byPage.set(k, []);
    byPage.get(k)!.push(c);
  }
  for (const [k, items] of byPage) {
    lines.push(`### ${k}`);
    for (const it of items.slice(0, 30)) {
      lines.push(`- [${it.tag}] "${it.text || it.ariaLabel}" ${it.href ? `→ ${it.href}` : ""}${it.disabled ? " (disabled)" : ""}`);
    }
  }
  lines.push("");
  lines.push("## 13. 사람이 최종 검수할 체크리스트");
  const checklist = [
    "첫 방문자가 3초 안에 무엇을 해야 할지 알 수 있는가",
    "검색창이 눈에 잘 띄는가",
    "차량명 검색과 규격명 검색 흐름이 둘 다 자연스러운가",
    "버튼을 눌렀을 때 고객 기대와 실제 이동이 맞는가",
    "주문하기가 너무 갑자기 결제로 떨어지지 않는가",
    "사진확인/상담/주문 버튼이 서로 역할이 명확한가",
    "회원가입 화면이 허술하지 않은가",
    "로그인 화면이 미완성처럼 보이지 않는가",
    "주문/결제 화면에서 가격 정책이 이해되는가",
    "지점/고객센터 번호 정책이 맞는가",
    "모바일에서 버튼이 누르기 쉬운가",
    "모바일에서 글자/이미지/카드가 깨지지 않는가",
    "고객에게 보이면 안 되는 내부 문구가 없는가",
  ];
  for (const c of checklist) lines.push(`- [ ] ${c}`);
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function ensureServerReachable(url: string): Promise<void> {
  try {
    const res = await fetch(url, { method: "GET", signal: AbortSignal.timeout(8000) });
    if (!res.ok && res.status >= 500) throw new Error(`HTTP ${res.status}`);
  } catch (e) {
    console.error(`\n❌ BASE_URL unreachable: ${url}`);
    console.error("   Start local server: npm run dev   (then re-run audit:journey)");
    console.error(`   Error: ${e}\n`);
    process.exit(1);
  }
}

async function main() {
  console.log(`\n🔍 Customer Journey Audit`);
  console.log(`   BASE_URL: ${BASE_URL}\n`);
  await ensureServerReachable(BASE_URL);

  const ctx = new JourneyAuditContext(BASE_URL);
  console.log(`📁 Output: ${relative(ROOT, ctx.runDir)}\n`);

  try {
    for (const vp of ["pc", "mobile"] as ViewportName[]) {
      console.log(`▶ Viewport: ${vp}`);
      await runAllJourneys(ctx, vp);
    }
  } finally {
    writeReports(ctx);
  }
}

function writeReports(ctx: JourneyAuditContext) {
  const indexHtml = generateIndexHtml(ctx);
  const reportMd = generateReportMd(ctx);
  const journeyMap = {
    startedAt: ctx.startedAt,
    baseUrl: ctx.baseUrl,
    gitHash: ctx.gitHash,
    buildStamp: ctx.buildStamp,
    steps: ctx.steps,
    skippedPaths: ctx.skippedPaths,
    pageIssues: ctx.pageIssues,
    summary: {
      totalSteps: ctx.steps.length,
      totalScreenshots: ctx.shotCounter,
      journeys: [...new Set(ctx.steps.map((s) => s.journeyName))].length,
      ok: ctx.steps.filter((s) => s.resultType === "ok").length,
      wrongDestination: ctx.steps.filter((s) => s.resultType === "wrong-destination").length,
      noResponse: ctx.steps.filter((s) => s.resultType === "no-response").length,
      skippedDangerous: ctx.steps.filter((s) => s.resultType === "skipped-dangerous-action").length,
      errors: ctx.steps.filter((s) => s.resultType === "error").length,
      cartEmpty: ctx.steps.filter((s) => s.resultType === "cart-empty").length,
      issues: ctx.steps.filter((s) => s.resultType === "issue").length,
    },
  };

  writeFileSync(join(ctx.runDir, "index.html"), indexHtml, "utf8");
  writeFileSync(join(ctx.runDir, "report.md"), reportMd, "utf8");
  writeFileSync(join(ctx.runDir, "journey-map.json"), JSON.stringify(journeyMap, null, 2), "utf8");

  console.log("\n✅ Done");
  console.log(`   index.html      → ${join(ctx.runDir, "index.html")}`);
  console.log(`   report.md       → ${join(ctx.runDir, "report.md")}`);
  console.log(`   journey-map.json → ${join(ctx.runDir, "journey-map.json")}`);
  console.log(`   screenshots     → ${ctx.shotCounter} PNG files`);
  console.log(`   steps           → ${ctx.steps.length}`);
  console.log(
    `   ok / wrong / skip / error / cart-empty / issue → ${journeyMap.summary.ok} / ${journeyMap.summary.wrongDestination} / ${journeyMap.summary.skippedDangerous} / ${journeyMap.summary.errors} / ${journeyMap.summary.cartEmpty} / ${journeyMap.summary.issues}\n`,
  );
  if (ctx.shotCounter < 10) {
    console.warn("⚠ 캡처 수가 적습니다. BASE_URL 서버 상태와 스크립트 오류를 확인하세요.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

// tsx direct execution guard
export {};
