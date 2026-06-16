/** 회원 이름·휴대폰 정규화 — 아이디 찾기 등 계정 복구용 */

export function normalizeMemberName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

export function normalizeMemberPhoneDigits(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10 && digits.startsWith("1")) return `0${digits}`;
  return digits;
}

export function formatPhoneForDisplay(digits: string): string {
  const d = normalizeMemberPhoneDigits(digits);
  if (d.length === 11) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return d;
}

export function maskLoginId(loginId: string): string {
  const id = loginId.trim();
  if (id.length <= 2) return `${id[0] ?? ""}*`;
  if (id.length <= 4) return `${id.slice(0, 1)}${"*".repeat(id.length - 2)}${id.slice(-1)}`;
  return `${id.slice(0, 3)}${"*".repeat(Math.min(id.length - 4, 5))}${id.slice(-1)}`;
}

export function maskEmail(email: string): string {
  const trimmed = email.trim();
  const at = trimmed.indexOf("@");
  if (at <= 0) return "***";
  const local = trimmed.slice(0, at);
  const domain = trimmed.slice(at + 1);
  const maskedLocal =
    local.length <= 1 ? "*" : `${local[0]}${"*".repeat(Math.min(local.length - 1, 4))}`;
  return `${maskedLocal}@${domain}`;
}

export function oauthProviderLabel(provider: string): string {
  switch (provider) {
    case "naver":
      return "네이버";
    case "kakao":
      return "카카오";
    case "google":
      return "Google";
    default:
      return "간편";
  }
}
