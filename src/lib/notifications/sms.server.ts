import "server-only";

import { getSolapiConfig, type SolapiConfig } from "@/lib/notifications/solapi.server";
import { normalizeMemberPhoneDigits } from "@/lib/auth/member-normalize";
import { createHmac, randomBytes } from "node:crypto";
import { isProductionRuntime } from "@/lib/db/operational-store-config";

function solapiAuthorizationHeader(config: SolapiConfig): string {
  const date = new Date().toISOString();
  const salt = randomBytes(16).toString("hex");
  const signature = createHmac("sha256", config.apiSecret)
    .update(`${date}${salt}`)
    .digest("hex");
  return `HMAC-SHA256 apiKey=${config.apiKey}, date=${date}, salt=${salt}, signature=${signature}`;
}

export function isSmsLiveEnabled(): boolean {
  return process.env.SOLAPI_SMS_LIVE === "true";
}

export function getSmsSenderNumber(): string | null {
  const from = process.env.SOLAPI_SENDER_NUMBER?.trim();
  return from || null;
}

export function isSmsConfigured(): boolean {
  return Boolean(getSolapiConfig() && getSmsSenderNumber());
}

export type SmsSendResult = { ok: true } | { ok: false; error: string };

/** SOLAPI SMS — SOLAPI_SMS_LIVE=true 일 때만 실제 발송 */
export async function sendSmsMessage(input: {
  to: string;
  text: string;
}): Promise<SmsSendResult> {
  const config = getSolapiConfig();
  const from = getSmsSenderNumber();
  if (!config || !from) {
    return {
      ok: false,
      error: isProductionRuntime()
        ? "SMS 발송 설정이 완료되지 않았습니다."
        : "SMS 발송 env(SOLAPI_*, SOLAPI_SENDER_NUMBER)가 필요합니다.",
    };
  }

  if (!isSmsLiveEnabled()) {
    return {
      ok: false,
      error: "SMS 발송이 비활성화되어 있습니다. (SOLAPI_SMS_LIVE=true 필요)",
    };
  }

  const to = normalizeMemberPhoneDigits(input.to);
  if (to.length < 10) {
    return { ok: false, error: "유효하지 않은 수신번호입니다." };
  }

  try {
    const res = await fetch("https://api.solapi.com/messages/v4/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: solapiAuthorizationHeader(config),
      },
      body: JSON.stringify({
        message: {
          to,
          from,
          text: input.text,
          type: "SMS",
        },
      }),
    });

    const data = (await res.json()) as {
      messageId?: string;
      groupId?: string;
      errorMessage?: string;
      message?: string;
    };

    if (!res.ok) {
      return { ok: false, error: data.errorMessage ?? data.message ?? `SOLAPI HTTP ${res.status}` };
    }
    if (!data.messageId && !data.groupId) {
      return { ok: false, error: "SMS 발송 응답이 올바르지 않습니다." };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "SMS 발송 실패" };
  }
}

export async function sendPhoneOtpSms(input: { to: string; otpCode: string }): Promise<SmsSendResult> {
  const text = `[배터리매니저] 인증번호는 ${input.otpCode} 입니다. 5분 내 입력해 주세요.`;
  return sendSmsMessage({ to: input.to, text });
}
