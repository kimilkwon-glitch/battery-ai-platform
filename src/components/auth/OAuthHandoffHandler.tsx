"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { buildCompleteProfileRedirectUrl } from "@/lib/customer-auth-redirect";
import { setCustomerSession } from "@/lib/customer-auth-session";
import { CUSTOMER_MYPAGE } from "@/lib/customer-auth-routes";
import { isProfileCompleteForCheckout } from "@/lib/customer-profile-complete";
import {
  getCustomerProfile,
  saveCustomerProfile,
  type AuthProvider,
} from "@/lib/customer-profile-storage";

type Props = {
  redirect?: string | null;
  onError?: (message: string) => void;
};

type HandoffProfile = {
  userId: string;
  name: string;
  email?: string;
  provider: AuthProvider;
};

export function OAuthHandoffHandler({ redirect, onError }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const handled = useRef(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const handoff = searchParams.get("oauth_handoff");
    if (handoff !== "kakao" || handled.current) return;
    handled.current = true;
    setBusy(true);

    const returnPath = redirect?.trim() || CUSTOMER_MYPAGE;

    void (async () => {
      try {
        const res = await fetch("/api/auth/kakao/complete", { credentials: "include" });
        const data = (await res.json()) as {
          ok: boolean;
          profile?: HandoffProfile;
          message?: string;
        };

        if (!data.ok || !data.profile) {
          onError?.(data.message ?? "카카오 로그인에 실패했습니다.");
          setBusy(false);
          return;
        }

        const existing = getCustomerProfile();
        const profile = saveCustomerProfile({
          id: data.profile.userId,
          name: data.profile.name,
          phone: existing?.id === data.profile.userId ? existing.phone : "",
          email: data.profile.email ?? existing?.email,
          postalCode: existing?.id === data.profile.userId ? existing.postalCode : undefined,
          address1: existing?.id === data.profile.userId ? existing.address1 : undefined,
          address2: existing?.id === data.profile.userId ? existing.address2 : undefined,
          provider: data.profile.provider,
        });

        setCustomerSession({
          userId: profile.id,
          displayName: profile.name,
          phone: profile.phone,
          email: profile.email,
          provider: profile.provider,
        });

        if (!isProfileCompleteForCheckout(profile)) {
          router.replace(buildCompleteProfileRedirectUrl(returnPath));
          return;
        }
        router.replace(returnPath);
      } catch {
        onError?.("카카오 로그인 처리 중 오류가 발생했습니다.");
        setBusy(false);
      }
    })();
  }, [searchParams, redirect, router, onError]);

  if (!busy) return null;

  return (
    <p className="bm-auth-notice text-sm" role="status" aria-live="polite">
      카카오 로그인을 완료하는 중입니다…
    </p>
  );
}
