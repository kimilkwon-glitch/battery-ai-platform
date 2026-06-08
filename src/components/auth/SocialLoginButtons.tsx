"use client";

import { SocialLoginButton } from "@/components/auth/SocialLoginButton";
import {
  getOAuthStartPath,
  type SocialLoginProvider,
} from "@/lib/auth/social-login-brand";
import { isSocialProviderEnabled } from "@/lib/auth/social-login-config";

const PROVIDERS: SocialLoginProvider[] = ["naver", "kakao", "google"];

type Props = {
  redirect?: string | null;
};

export function SocialLoginButtons({ redirect }: Props) {
  const enabledProviders = PROVIDERS.filter((provider) => isSocialProviderEnabled(provider));

  if (enabledProviders.length === 0) {
    return null;
  }

  return (
    <div className="bm-social-login">
      {enabledProviders.map((provider) => (
        <SocialLoginButton
          key={provider}
          provider={provider}
          href={getOAuthStartPath(provider, redirect)}
        />
      ))}
      <p className="bm-auth-notice text-[10px]" role="note">
        간편 로그인 시 제공되는 이름·이메일이 회원정보에 저장됩니다. 휴대폰·주소는 추가 입력 후
        주문을 진행할 수 있습니다.
      </p>
    </div>
  );
}
