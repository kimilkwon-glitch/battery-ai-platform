"use client";

import { useEffect, useState } from "react";
import { SocialLoginButton } from "@/components/auth/SocialLoginButton";
import {
  getOAuthStartPath,
  type SocialLoginProvider,
  type SocialLoginVariant,
} from "@/lib/auth/social-login-brand";

const PROVIDERS: SocialLoginProvider[] = ["naver", "kakao", "google"];

type ProviderAvailability = Record<SocialLoginProvider, boolean>;

type Props = {
  redirect?: string | null;
  variant?: SocialLoginVariant;
  onAvailability?: (count: number) => void;
};

function warnDevProviderMismatch(available: ProviderAvailability): void {
  if (process.env.NODE_ENV !== "development") return;

  const legacyFlags: Record<SocialLoginProvider, string | undefined> = {
    naver: process.env.NEXT_PUBLIC_NAVER_LOGIN_ENABLED,
    kakao: process.env.NEXT_PUBLIC_KAKAO_LOGIN_ENABLED,
    google: process.env.NEXT_PUBLIC_GOOGLE_LOGIN_ENABLED,
  };

  for (const provider of PROVIDERS) {
    const flag = legacyFlags[provider];
    if (available[provider] && flag !== "true") {
      console.warn(
        `[auth] ${provider} OAuth is configured on the server, but NEXT_PUBLIC_${provider.toUpperCase()}_LOGIN_ENABLED is not "true". Buttons are shown via /api/auth/providers.`,
      );
    }
    if (!available[provider] && flag === "true") {
      console.warn(
        `[auth] NEXT_PUBLIC_${provider.toUpperCase()}_LOGIN_ENABLED=true but server OAuth env is incomplete. ${provider} button is hidden.`,
      );
    }
  }

  const missing = PROVIDERS.filter((p) => !available[p]);
  if (missing.length > 0) {
    console.warn(
      `[auth] OAuth not configured for: ${missing.join(", ")}. Set server env vars (see oauth-providers.ts).`,
    );
  }
}

export function SocialLoginButtons({ redirect, variant = "login", onAvailability }: Props) {
  const [available, setAvailable] = useState<ProviderAvailability | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const res = await fetch("/api/auth/providers", { cache: "no-store" });
        if (!res.ok) throw new Error("providers unavailable");
        const data = (await res.json()) as ProviderAvailability;
        if (cancelled) return;
        setAvailable(data);
        warnDevProviderMismatch(data);
        onAvailability?.(PROVIDERS.filter((p) => data[p]).length);
      } catch {
        if (!cancelled) {
          setAvailable({ naver: false, kakao: false, google: false });
          onAvailability?.(0);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [onAvailability]);

  if (!available) {
    return (
      <div className="bm-social-login bm-social-login--loading" aria-busy="true">
        <div className="bm-social-login__skeleton" />
        <div className="bm-social-login__skeleton" />
        <div className="bm-social-login__skeleton" />
      </div>
    );
  }

  const enabledProviders = PROVIDERS.filter((provider) => available[provider]);
  if (enabledProviders.length === 0) return null;

  return (
    <div className="bm-social-login">
      {enabledProviders.map((provider) => (
        <SocialLoginButton
          key={provider}
          provider={provider}
          href={getOAuthStartPath(provider, redirect)}
          variant={variant}
        />
      ))}
    </div>
  );
}

export function hasAnySocialLoginAvailable(available: ProviderAvailability | null): boolean {
  if (!available) return false;
  return PROVIDERS.some((provider) => available[provider]);
}
