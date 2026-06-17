import "server-only";

/** Vercel·로컬에서 신뢰 가능한 클라이언트 IP — x-forwarded-for 첫 값만 맹신하지 않음 */
export function getTrustedClientIp(request: Request): string {
  const vercelForwarded = request.headers.get("x-vercel-forwarded-for");
  if (vercelForwarded) {
    const ip = vercelForwarded.split(",")[0]?.trim();
    if (isPlausibleClientIp(ip)) return ip!;
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (isPlausibleClientIp(realIp)) return realIp!;

  if (process.env.VERCEL === "1") {
    return "unknown";
  }

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const ip = forwarded.split(",")[0]?.trim();
    if (isPlausibleClientIp(ip)) return ip!;
  }

  return "unknown";
}

function isPlausibleClientIp(value: string | undefined | null): value is string {
  if (!value || value === "unknown") return false;
  if (value.length > 45) return false;
  if (/^[0-9a-fA-F:.]+$/.test(value)) return true;
  return false;
}

/** @deprecated getTrustedClientIp 사용 */
export function getClientIp(request: Request): string {
  return getTrustedClientIp(request);
}
