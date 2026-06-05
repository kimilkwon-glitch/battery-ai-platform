/** 클라이언트용 토스 설정 (NEXT_PUBLIC 키만) */

export function getPublicTossClientKey(): string | null {
  const key = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY?.trim();
  return key || null;
}

export function isPublicTossTestKey(): boolean {
  const key = getPublicTossClientKey();
  return Boolean(key?.startsWith("test_"));
}

/** 토스 결제위젯 customerMobilePhone 형식 (숫자만, 8~11자리) */
export function normalizeTossMobilePhone(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("82") && digits.length > 10) {
    digits = `0${digits.slice(2)}`;
  }
  return digits;
}
