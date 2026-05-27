import path from "path";

export const UX_AUDIT_DIR = path.resolve(__dirname);
export const REPORTS_DIR = path.join(UX_AUDIT_DIR, "reports");
export const SCREENSHOTS_DIR = path.join(REPORTS_DIR, "screenshots");

export type AuditRunMode = "QUICK" | "DEFAULT" | "FULL";

export function getBaseUrl(): string {
  return process.env.UX_AUDIT_BASE_URL?.trim() || "http://localhost:3000";
}

export function getAuditLimit(defaultLimit = 100): number {
  const raw = process.env.UX_AUDIT_LIMIT?.trim();
  const n = raw ? parseInt(raw, 10) : defaultLimit;
  if (Number.isNaN(n) || n < 1) return defaultLimit;
  return Math.min(n, 500);
}

export function getRunMode(): AuditRunMode {
  const limit = getAuditLimit(100);
  if (limit <= 30) return "QUICK";
  if (limit >= 500) return "FULL";
  return "DEFAULT";
}

export function getScreenshotLimit(): number {
  const mode = getRunMode();
  if (mode === "QUICK") return 10;
  if (mode === "FULL") return 50;
  return 30;
}

/** HIGH 이슈 스크린샷 저장. UX_AUDIT_SCREENSHOTS=false 이면 비활성 */
export function shouldSaveScreenshots(): boolean {
  const raw = process.env.UX_AUDIT_SCREENSHOTS?.trim().toLowerCase();
  if (raw === "false" || raw === "0" || raw === "off") return false;
  return true;
}
