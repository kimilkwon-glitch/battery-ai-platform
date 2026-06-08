import type { PreferredStoreId } from "@/lib/customer-profile-storage";
import type { MemberPreferredStore } from "@/lib/auth/member-types";

export const MEMBER_PREFERRED_STORE_LABELS: Record<MemberPreferredStore, string> = {
  deokcheon: "덕천점",
  hakjang: "학장점",
};

const VALID_DB_STORES = new Set<MemberPreferredStore>(["deokcheon", "hakjang"]);

export function isMemberPreferredStore(value: string): value is MemberPreferredStore {
  return VALID_DB_STORES.has(value as MemberPreferredStore);
}

/** PATCH body → DB 값 (undecided/빈값 → null) */
export function parsePreferredStoreInput(
  raw: unknown,
): MemberPreferredStore | null | "invalid" | undefined {
  if (raw === undefined) return undefined;
  if (raw === null || raw === "" || raw === "undecided") return null;
  const v = String(raw).trim();
  if (!v || v === "undecided") return null;
  if (isMemberPreferredStore(v)) return v;
  return "invalid";
}

/** DB → UI select 값 */
export function memberPreferredStoreToUi(
  store: MemberPreferredStore | null | undefined,
): PreferredStoreId {
  if (store === "deokcheon" || store === "hakjang") return store;
  return "undecided";
}

/** UI select → DB */
export function uiPreferredStoreToMember(
  id: PreferredStoreId,
): MemberPreferredStore | null {
  if (id === "deokcheon" || id === "hakjang") return id;
  return null;
}

export function memberPreferredStoreLabel(
  store: MemberPreferredStore | null | undefined,
): string {
  if (!store) return "아직 선택 안 함";
  return MEMBER_PREFERRED_STORE_LABELS[store];
}
