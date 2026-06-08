/**
 * @deprecated 서버 API 사용 — GET /api/auth/check-login-id?loginId=
 */
import { isValidLoginId } from "@/lib/auth/signup-validation";

export type LoginIdCheckResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

/** 클라이언트 형식 검증만 (중복 확인은 서버 API) */
export function checkLoginIdForSignup(loginId: string): LoginIdCheckResult {
  const trimmed = loginId.trim();
  if (!isValidLoginId(trimmed)) {
    return {
      ok: false,
      message: "아이디는 영문·숫자 4~20자로 입력해 주세요.",
    };
  }
  return {
    ok: true,
    message: "아이디 형식이 올바릅니다.",
  };
}
