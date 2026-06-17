export const MEMBER_AUTH_MESSAGES = {
  invalidInput: "입력값을 다시 확인해 주세요.",
  loginIdTaken: "이미 사용 중인 아이디입니다.",
  emailTaken: "이미 사용 중인 이메일입니다.",
  phoneTaken: "이미 가입된 휴대폰 번호입니다.",
  /** 중복·race 시 계정 존재 여부 노출 방지 */
  signupConflict: "입력하신 정보로는 가입할 수 없습니다. 입력값을 다시 확인해 주세요.",
  loginFailed: "아이디 또는 비밀번호를 확인해 주세요.",
  loginRateLimited: "로그인 시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.",
  loginRequired: "로그인이 필요합니다.",
  profileSaveFailed: "회원정보 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.",
  serviceUnavailable: "회원 서비스를 일시적으로 이용할 수 없습니다. 잠시 후 다시 시도해 주세요.",
} as const;
