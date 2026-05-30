/** 금지 문구 grep 매치 — 고객 노출 vs 내부·인증 구분 */
export type ForbiddenMatchScope =
  | "customer_facing"
  | "internal_or_auth_pending"
  | "audit_meta"
  | "admin_only";

const INTERNAL_OR_AUTH = [
  /^src\/app\/login\//,
  /^src\/app\/signup\//,
  /^src\/app\/admin\//,
  /^src\/components\/admin\//,
];

export function classifyForbiddenFile(file: string): ForbiddenMatchScope {
  if (file.includes("ai-audit")) return "audit_meta";
  if (INTERNAL_OR_AUTH.some((re) => re.test(file))) return "internal_or_auth_pending";
  if (file.includes("/admin/") || file.startsWith("src/components/admin/")) return "admin_only";
  if (file.startsWith("src/data/") && file.endsWith(".meta.json")) return "internal_or_auth_pending";
  return "customer_facing";
}

export function isCustomerFacingForbiddenFile(file: string): boolean {
  return classifyForbiddenFile(file) === "customer_facing";
}
