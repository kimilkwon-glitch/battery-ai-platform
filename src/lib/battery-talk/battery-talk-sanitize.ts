/** 배터리톡 입력 검증·XSS 방지 */

export const BATTERY_TALK_MESSAGE_MAX_LEN = 2000;
export const BATTERY_TALK_PHONE_MAX_LEN = 20;

export function sanitizeBatteryTalkMessage(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .trim()
    .slice(0, BATTERY_TALK_MESSAGE_MAX_LEN);
}

export function sanitizeBatteryTalkPhone(raw: string): string {
  return raw.trim().slice(0, BATTERY_TALK_PHONE_MAX_LEN);
}

export function isValidBatteryTalkMessage(body: string): boolean {
  const sanitized = sanitizeBatteryTalkMessage(body);
  return sanitized.length >= 1;
}
