import "server-only";

import { isProductionRuntime } from "@/lib/db/operational-store-config";
import { getSiteOrigin } from "@/lib/site-url";

export type EmailSendResult = { ok: true } | { ok: false; error: string };

export function getAuthEmailFrom(): string | null {
  return process.env.AUTH_EMAIL_FROM?.trim() || process.env.RESEND_FROM?.trim() || null;
}

export function getResendApiKey(): string | null {
  return process.env.RESEND_API_KEY?.trim() || null;
}

export function isEmailConfigured(): boolean {
  return Boolean(getResendApiKey() && getAuthEmailFrom());
}

export function isEmailLiveEnabled(): boolean {
  return process.env.AUTH_EMAIL_LIVE === "true";
}

export function getPublicSiteOrigin(): string {
  return getSiteOrigin();
}

export async function sendTransactionalEmail(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<EmailSendResult> {
  const apiKey = getResendApiKey();
  const from = getAuthEmailFrom();

  if (!apiKey || !from) {
    return {
      ok: false,
      error: isProductionRuntime()
        ? "이메일 발송 설정이 완료되지 않았습니다."
        : "이메일 env(RESEND_API_KEY, AUTH_EMAIL_FROM)가 필요합니다.",
    };
  }

  if (!isEmailLiveEnabled()) {
    return {
      ok: false,
      error: "이메일 발송이 비활성화되어 있습니다. (AUTH_EMAIL_LIVE=true 필요)",
    };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `배터리매니저 <${from}>`,
        to: [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text,
      }),
    });

    const data = (await res.json()) as { id?: string; message?: string; name?: string };
    if (!res.ok) {
      return { ok: false, error: data.message ?? `Resend HTTP ${res.status}` };
    }
    if (!data.id) {
      return { ok: false, error: "이메일 발송 응답이 올바르지 않습니다." };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "이메일 발송 실패" };
  }
}

export async function sendPasswordResetEmail(input: {
  to: string;
  resetUrl: string;
  requestedAt: Date;
}): Promise<EmailSendResult> {
  const timeLabel = input.requestedAt.toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
  const subject = "배터리매니저 비밀번호 재설정 안내";
  const text = [
    "배터리매니저 비밀번호 재설정을 요청하셨습니다.",
    "",
    `요청 시간: ${timeLabel}`,
    `재설정 링크 (30분 유효): ${input.resetUrl}`,
    "",
    "본인이 요청하지 않았다면 이 메일을 무시해 주세요.",
    "비밀번호 원문은 이메일로 전송되지 않습니다.",
  ].join("\n");

  const html = `
    <div style="font-family:sans-serif;line-height:1.6;color:#0f172a;max-width:560px">
      <h1 style="font-size:20px;margin:0 0 12px">비밀번호 재설정</h1>
      <p>배터리매니저 비밀번호 재설정을 요청하셨습니다.</p>
      <p style="color:#64748b;font-size:14px">요청 시간: ${timeLabel}</p>
      <p style="margin:24px 0">
        <a href="${input.resetUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:700">
          비밀번호 재설정하기
        </a>
      </p>
      <p style="font-size:13px;color:#64748b">링크는 30분 동안 유효합니다. 본인이 요청하지 않았다면 이 메일을 무시해 주세요.</p>
    </div>
  `;

  return sendTransactionalEmail({ to: input.to, subject, html, text });
}
