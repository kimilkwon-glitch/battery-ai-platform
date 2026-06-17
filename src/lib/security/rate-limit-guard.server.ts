import "server-only";

import { NextResponse } from "next/server";
import { ACCOUNT_RECOVERY_MESSAGES } from "@/lib/auth/account-recovery-messages";
import { MEMBER_AUTH_MESSAGES } from "@/lib/auth/member-auth-errors";
import { getTrustedClientIp } from "@/lib/security/client-ip.server";
import { hashRateLimitIp } from "@/lib/security/rate-limit-hash.server";
import {
  consumeRateLimit,
  consumeRateLimitForIp,
  rateLimitBlockedResponse,
  type RateLimitPolicy,
} from "@/lib/security/rate-limit.server";

const DEFAULT_SENSITIVE_MESSAGE = "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.";

export async function enforceRateLimitOrNull(params: {
  request: Request;
  namespace: string;
  limit: number;
  windowMs: number;
  parts?: string[];
  ipOnly?: boolean;
  policy?: RateLimitPolicy;
  message?: string;
}): Promise<NextResponse | null> {
  const policy = params.policy ?? "sensitive";
  const message = params.message ?? DEFAULT_SENSITIVE_MESSAGE;

  const checks = [];
  if (params.ipOnly !== false) {
    checks.push(
      consumeRateLimitForIp(params.namespace, params.request, params.limit, params.windowMs, policy),
    );
  }
  if (params.parts?.length) {
    checks.push(
      consumeRateLimit({
        namespace: params.namespace,
        parts: params.parts,
        limit: params.limit,
        windowMs: params.windowMs,
        policy,
      }),
    );
  }

  const results = await Promise.all(checks);
  const blocked = results.find((r) => !r.ok);
  if (!blocked || blocked.ok) return null;

  const resp = rateLimitBlockedResponse(message, blocked.retryAfterSec, blocked.storeUnavailable);
  return NextResponse.json(resp.body, { status: resp.status, headers: resp.headers });
}

export async function enforceIpRateLimitOrNull(
  request: Request,
  namespace: string,
  limit: number,
  windowMs: number,
  message = DEFAULT_SENSITIVE_MESSAGE,
): Promise<NextResponse | null> {
  return enforceRateLimitOrNull({ request, namespace, limit, windowMs, ipOnly: true, message });
}

export { getTrustedClientIp, hashRateLimitIp, ACCOUNT_RECOVERY_MESSAGES, MEMBER_AUTH_MESSAGES };
