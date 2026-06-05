"use client";

import { useState } from "react";

type Provider = "naver" | "kakao" | "google";

const BUTTONS: {
  id: Provider;
  label: string;
  className: string;
  icon: string;
}[] = [
  {
    id: "naver",
    label: "네이버로 계속하기",
    className: "bm-social-btn bm-social-btn--naver",
    icon: "N",
  },
  {
    id: "kakao",
    label: "카카오로 계속하기",
    className: "bm-social-btn bm-social-btn--kakao",
    icon: "K",
  },
  {
    id: "google",
    label: "구글로 계속하기",
    className: "bm-social-btn bm-social-btn--google",
    icon: "G",
  },
];

export function SocialLoginButtons() {
  const [notice, setNotice] = useState<string | null>(null);

  const handleClick = () => {
    setNotice(
      "간편 로그인은 준비 중입니다. 현재는 휴대폰 번호로 회원가입을 이용해 주세요.",
    );
  };

  return (
    <div className="bm-social-login space-y-3">
      {BUTTONS.map((btn) => (
        <button
          key={btn.id}
          type="button"
          className={btn.className}
          onClick={handleClick}
        >
          <span className="bm-social-btn__icon" aria-hidden>
            {btn.icon}
          </span>
          <span className="bm-social-btn__label">{btn.label}</span>
        </button>
      ))}
      {notice ? (
        <p className="bm-auth-notice" role="status">
          {notice}
        </p>
      ) : null}
    </div>
  );
}
