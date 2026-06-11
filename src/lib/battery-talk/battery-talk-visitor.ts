/** 비로그인 배터리톡 고객 식별 — 브라우저 localStorage 기준 (IP 사용 금지) */

export const BATTERY_TALK_VISITOR_STORAGE_KEY = "bm-bt-visitor-id";
export const BATTERY_TALK_VISITOR_THREADS_KEY = "bm-bt-visitor-threads";

let memoryVisitorId: string | null = null;

export function createBatteryTalkVisitorId(): string {
  return `btv_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function readVisitorThreadMap(): Record<string, string[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(BATTERY_TALK_VISITOR_THREADS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string[]>) : {};
  } catch {
    return {};
  }
}

function writeVisitorThreadMap(map: Record<string, string[]>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(BATTERY_TALK_VISITOR_THREADS_KEY, JSON.stringify(map));
  } catch {
    /* ignore quota / private mode */
  }
}

/** 이전 visitorId 키에 묶인 threadId를 현재 visitor로 이전 (localStorage 키 변경 시 복구) */
function migrateOrphanThreadIds(currentVisitorId: string): string[] {
  const map = readVisitorThreadMap();
  const orphans = new Set<string>();
  for (const [key, ids] of Object.entries(map)) {
    if (key === currentVisitorId) continue;
    for (const id of ids) {
      if (id.trim()) orphans.add(id.trim());
    }
  }
  if (orphans.size === 0) return [];
  const current = map[currentVisitorId] ?? [];
  map[currentVisitorId] = [...new Set([...current, ...orphans])].slice(0, 30);
  writeVisitorThreadMap(map);
  return [...orphans];
}

export function getOrCreateBatteryTalkVisitorId(): string {
  if (typeof window === "undefined") return "";
  try {
    const existing = localStorage.getItem(BATTERY_TALK_VISITOR_STORAGE_KEY)?.trim();
    if (existing) {
      memoryVisitorId = existing;
      return existing;
    }
    const next = memoryVisitorId ?? createBatteryTalkVisitorId();
    localStorage.setItem(BATTERY_TALK_VISITOR_STORAGE_KEY, next);
    memoryVisitorId = next;
    return next;
  } catch {
    if (!memoryVisitorId) memoryVisitorId = createBatteryTalkVisitorId();
    return memoryVisitorId;
  }
}

export function registerBatteryTalkThreadForVisitor(threadId: string, visitorId?: string): void {
  if (typeof window === "undefined" || !threadId.trim()) return;
  const vid = visitorId?.trim() || getOrCreateBatteryTalkVisitorId();
  if (!vid) return;
  const map = readVisitorThreadMap();
  const list = map[vid] ?? [];
  const trimmed = threadId.trim();
  if (!list.includes(trimmed)) {
    map[vid] = [trimmed, ...list].slice(0, 30);
    writeVisitorThreadMap(map);
  }
}

export function getBatteryTalkThreadIdsForVisitor(visitorId?: string): string[] {
  if (typeof window === "undefined") return [];
  const vid = visitorId?.trim() || getOrCreateBatteryTalkVisitorId();
  if (!vid) return [];
  const map = readVisitorThreadMap();
  let list = map[vid] ?? [];
  if (list.length === 0) {
    migrateOrphanThreadIds(vid);
    list = readVisitorThreadMap()[vid] ?? [];
  }
  return list;
}
