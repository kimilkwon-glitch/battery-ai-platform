import "server-only";

import { createHmac, randomBytes } from "node:crypto";
import type { SolapiAlimtalkPayload } from "@/lib/notifications/alimtalk-types";

export type SolapiConfig = {
  apiKey: string;
  apiSecret: string;
  pfId: string;
};

export function getSolapiConfig(): SolapiConfig | null {
  const apiKey = process.env.SOLAPI_API_KEY?.trim();
  const apiSecret = process.env.SOLAPI_API_SECRET?.trim();
  const pfId = process.env.SOLAPI_KAKAO_PFID?.trim();
  if (!apiKey || !apiSecret || !pfId) return null;
  return { apiKey, apiSecret, pfId };
}

export function isAlimtalkLiveEnabled(): boolean {
  return process.env.SOLAPI_ALIMTALK_LIVE === "true";
}

/** 국내 휴대폰 — 숫자만, 10~11자리 */
export function normalizeAlimtalkPhone(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10 && digits.startsWith("1")) return `0${digits}`;
  if (digits.length === 11 && digits.startsWith("01")) return digits;
  if (digits.length >= 10 && digits.length <= 11) return digits;
  return null;
}

export function getTemplateIdForEnvKey(envKey: string): string | null {
  const id = process.env[envKey]?.trim();
  return id || null;
}

export function buildSolapiAlimtalkPayload(input: {
  phone: string;
  pfId: string;
  templateId: string;
  variables: Record<string, string>;
}): SolapiAlimtalkPayload {
  return {
    to: input.phone,
    pfId: input.pfId,
    templateId: input.templateId,
    variables: input.variables,
  };
}

function solapiAuthorizationHeader(config: SolapiConfig): string {
  const date = new Date().toISOString();
  const salt = randomBytes(16).toString("hex");
  const signature = createHmac("sha256", config.apiSecret)
    .update(`${date}${salt}`)
    .digest("hex");
  return `HMAC-SHA256 apiKey=${config.apiKey}, date=${date}, salt=${salt}, signature=${signature}`;
}

export type SolapiDispatchResult =
  | { ok: true; messageId: string }
  | { ok: false; error: string };

/** 실제 HTTP 호출 — SOLAPI_ALIMTALK_LIVE=true 일 때만 alimtalk-service에서 호출 */
export async function dispatchSolapiAlimtalk(
  config: SolapiConfig,
  payload: SolapiAlimtalkPayload,
): Promise<SolapiDispatchResult> {
  const body = {
    message: {
      to: payload.to,
      type: "ATA",
      kakaoOptions: {
        pfId: payload.pfId,
        templateId: payload.templateId,
        variables: payload.variables,
      },
    },
  };

  try {
    const res = await fetch("https://api.solapi.com/messages/v4/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: solapiAuthorizationHeader(config),
      },
      body: JSON.stringify(body),
    });
    const data = (await res.json()) as {
      messageId?: string;
      groupId?: string;
      errorCode?: string;
      errorMessage?: string;
      message?: string;
    };
    if (!res.ok) {
      const msg = data.errorMessage ?? data.message ?? `SOLAPI HTTP ${res.status}`;
      return { ok: false, error: msg };
    }
    const messageId = data.messageId ?? data.groupId ?? null;
    if (!messageId) {
      return { ok: false, error: "SOLAPI 응답에 messageId가 없습니다." };
    }
    return { ok: true, messageId };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "SOLAPI 요청 실패";
    return { ok: false, error: msg };
  }
}

export function formatAlimtalkAmount(amount: number | null | undefined): string {
  if (amount == null || Number.isNaN(amount)) return "0원";
  return `${Math.round(amount).toLocaleString("ko-KR")}원`;
}
