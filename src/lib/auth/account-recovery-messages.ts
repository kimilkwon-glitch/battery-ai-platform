/** 계정 복구 — 공통 응답 (계정 열거 방지) */

export const ACCOUNT_RECOVERY_MESSAGES = {
  findIdSendOk:
    "입력하신 정보와 일치하는 계정이 있다면 휴대폰으로 인증번호를 발송했습니다.",
  findIdNotFound: "입력하신 정보로 가입된 계정을 확인할 수 없습니다.",
  forgotPasswordOk:
    "입력하신 정보와 일치하는 계정이 있다면 가입 이메일로 비밀번호 재설정 안내를 발송했습니다.",
  otpInvalid: "인증번호가 올바르지 않거나 만료되었습니다.",
  otpMaxAttempts: "인증 시도 횟수를 초과했습니다. 잠시 후 다시 시도해 주세요.",
  otpExpired: "인증번호가 만료되었습니다. 다시 발송해 주세요.",
  resetLinkInvalid:
    "유효하지 않거나 만료된 링크입니다. 비밀번호 찾기를 다시 진행해 주세요.",
  passwordChanged: "비밀번호가 변경되었습니다. 다시 로그인해 주세요.",
  passwordSameAsCurrent: "새 비밀번호는 현재 비밀번호와 달라야 합니다.",
  currentPasswordWrong: "현재 비밀번호가 올바르지 않습니다.",
  oauthAccount: "간편 로그인 계정입니다. 비밀번호 변경은 지원하지 않습니다.",
  rateLimited: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.",
  smsUnavailable: "인증번호 발송을 준비 중입니다. 잠시 후 다시 시도해 주세요.",
  emailUnavailable: "이메일 발송을 준비 중입니다. 잠시 후 다시 시도해 주세요.",
} as const;

export const OTP_TTL_MS = 5 * 60 * 1000;
export const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;
export const OTP_RESEND_COOLDOWN_MS = 60 * 1000;

/** 응답 시간 균일화 — 계정 열거 방지 */
export async function uniformRecoveryDelay(ms = 350): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}
