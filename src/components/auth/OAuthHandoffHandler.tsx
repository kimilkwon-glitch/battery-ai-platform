"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { fetchCustomerAuthMe } from "@/lib/auth/customer-auth-client";
import { isMemberProfileCompleteForCheckout } from "@/lib/auth/member-profile-complete";
import { applyOAuthMemberCache } from "@/lib/auth/oauth-client-session";
import { buildCompleteProfileRedirectUrl } from "@/lib/customer-auth-redirect";
import { CUSTOMER_MYPAGE } from "@/lib/customer-auth-routes";
import type { MemberPublic } from "@/lib/auth/member-types";

type Props = {
  redirect?: string | null;
  onError?: (message: string) => void;
};

/** 레거시 oauth_handoff 쿼리 — 신규 OAuth는 callback에서 세션 발급 후 직접 redirect */
const HANDOFF_PROVIDERS = ["kakao", "google"] as const;
type HandoffProvider = (typeof HANDOFF_PROVIDERS)[number];

const PROVIDER_LABEL: Record<HandoffProvider, string> = {
  kakao: "카카오",
  google: "구글",
};

const DEFAULT_FAIL_MESSAGE: Record<HandoffProvider, string> = {
  kakao: "카카오 로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.",
  google: "구글 로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.",
};

function isHandoffProvider(value: string | null): value is HandoffProvider {
  return value != null && (HANDOFF_PROVIDERS as readonly string[]).includes(value);
}

export function OAuthHandoffHandler({ redirect, onError }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const handled = useRef(false);
  const [busyProvider, setBusyProvider] = useState<HandoffProvider | null>(null);

  useEffect(() => {
    const handoff = searchParams.get("oauth_handoff");
    if (!isHandoffProvider(handoff) || handled.current) return;
    handled.current = true;
    setBusyProvider(handoff);

    const returnPath = redirect?.trim() || CUSTOMER_MYPAGE;

    void (async () => {
      try {
        const res = await fetch(`/api/auth/${handoff}/complete`, { credentials: "include" });
        const data = (await res.json()) as {
          ok: boolean;
          member?: MemberPublic;
          message?: string;
        };

        if (!data.ok || !data.member) {
          onError?.(data.message ?? DEFAULT_FAIL_MESSAGE[handoff]);
          setBusyProvider(null);
          return;
        }

        applyOAuthMemberCache(data.member);
        await fetchCustomerAuthMe();

        if (!isMemberProfileCompleteForCheckout(data.member)) {
          router.replace(buildCompleteProfileRedirectUrl(returnPath));
          return;
        }
        router.replace(returnPath);
      } catch {
        onError?.(DEFAULT_FAIL_MESSAGE[handoff]);
        setBusyProvider(null);
      }
    })();
  }, [searchParams, redirect, router, onError]);

  if (!busyProvider) return null;

  return (
    <p className="text-sm font-semibold text-slate-600" role="status" aria-live="polite">
      {PROVIDER_LABEL[busyProvider]} 로그인을 완료하는 중입니다…
    </p>
  );
}
