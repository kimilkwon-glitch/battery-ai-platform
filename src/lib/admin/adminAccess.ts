/** 개발 단계용 관리자 접근 키 — 운영 전 로그인 방식으로 교체 예정 */
export const ADMIN_ACCESS_KEY =
  process.env.NEXT_PUBLIC_ADMIN_ACCESS_KEY ?? "battery-manager-admin";

export function verifyAdminAccessKey(key: string | undefined | null): boolean {
  if (!key?.trim()) return false;
  return key.trim() === ADMIN_ACCESS_KEY;
}
