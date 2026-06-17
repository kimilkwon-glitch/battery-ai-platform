export const LOGIN_ID_PATTERN = /^[a-zA-Z0-9]{4,20}$/;

export function isValidLoginId(value: string): boolean {
  return LOGIN_ID_PATTERN.test(value.trim());
}

export function isValidEmail(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

export function isValidPhoneDigits(digits: string): boolean {
  return digits.length >= 10 && digits.length <= 11;
}

export const MAX_PASSWORD_LENGTH = 128;

export function isValidPassword(value: string): boolean {
  return value.length >= 8 && value.length <= MAX_PASSWORD_LENGTH;
}
