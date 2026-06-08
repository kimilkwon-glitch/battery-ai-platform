"use client";

import Image from "next/image";
import clsx from "clsx";
import {
  getSocialLoginBrand,
  type SocialLoginProvider,
} from "@/lib/auth/social-login-brand";

type Props = {
  provider: SocialLoginProvider;
  href: string;
};

export function SocialLoginButton({ provider, href }: Props) {
  const brand = getSocialLoginBrand(provider);

  return (
    <a
      href={href}
      className={clsx("bm-social-btn", `bm-social-btn--${provider}`)}
    >
      <span className="bm-social-btn__logo" aria-hidden>
        <Image
          src={brand.iconSrc}
          alt=""
          width={brand.iconSize}
          height={brand.iconSize}
          className="bm-social-btn__logo-img"
          unoptimized
        />
      </span>
      <span className="bm-social-btn__label">{brand.label}</span>
    </a>
  );
}
