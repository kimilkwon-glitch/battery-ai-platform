/** 비로그인 배터리톡 고객 식별 — 브라우저 localStorage 기준 (IP 사용 금지) */

export const BATTERY_TALK_VISITOR_STORAGE_KEY = "bm-bt-visitor-id";
export const BATTERY_TALK_VISITOR_THREADS_KEY = "bm-bt-visitor-threads";

export function createBatteryTalkVisitorId(): string {
  return `btv_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function getOrCreateBatteryTalkVisitorId(): string {
  if (typeof window === "undefined") return "";
  try {
    const existing = localStorage.getItem(BATTERY_TALK_VISITOR_STORAGE_KEY)?.trim();
    if (existing) return existing;
    const next = createBatteryTalkVisitorId();
    localStorage.setItem(BATTERY_TALK_VISITOR_STORAGE_KEY, next);
    return next;
  } catch {
    return createBatteryTalkVisitorId();
  }
}

export function registerBatteryTalkThreadForVisitor(threadId: string, visitorId?: string): void {
  if (typeof window === "undefined" || !threadId.trim()) return;
  const vid = visitorId?.trim() || getOrCreateBatteryTalkVisitorId();
  if (!vid) return;
  try {
    const raw = localStorage.getItem(BATTERY_TALK_VISITOR_THREADS_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, string[]>) : {};
    const list = map[vid] ?? [];
    if (!list.includes(threadId)) {
      map[vid] = [threadId, ...list].slice(0, 30);
      localStorage.setItem(BATTERY_TALK_VISITOR_THREADS_KEY, JSON.stringify(map));
    }
  } catch {
    /* ignore quota / private mode */
  }
}

export function getBatteryTalkThreadIdsForVisitor(visitorId?: string): string[] {
  if (typeof window === "undefined") return [];
  const vid = visitorId?.trim() || localStorage.getItem(BATTERY_TALK_VISITOR_STORAGE_KEY)?.trim();
  if (!vid) return [];
  try {
    const raw = localStorage.getItem(BATTERY_TALK_VISITOR_THREADS_KEY);
    if (!raw) return [];
    const map = JSON.parse(raw) as Record<string, string[]>;
    return map[vid] ?? [];
  } catch {
    return [];
  }
}
