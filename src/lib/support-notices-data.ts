/**
 * 고객센터 공지 — 서버 조회 파사드
 */

import {
  getSupportNoticeById,
  listHubSupportNotices,
  type SupportNoticeRecord,
} from "@/lib/support-notices-store";
import { SUPPORT_NOTICES_SEED } from "@/lib/support-notices-seed";

export type SupportNotice = {
  id: string;
  title: string;
  date: string;
  important?: boolean;
  imageSrc?: string;
  imageAlt?: string;
  bodyHtml: string;
};

async function toPublicNotice(record: SupportNoticeRecord): Promise<SupportNotice> {
  const { sanitizeNoticeHtml } = await import("@/lib/security/sanitize-notice-html.server");
  return {
    id: record.id,
    title: record.title,
    date: record.date,
    important: record.important,
    imageSrc: record.imageSrc,
    imageAlt: record.imageAlt,
    bodyHtml: sanitizeNoticeHtml(record.bodyHtml),
  };
}

/** 클라이언트 fallback용 정적 샘플 */
export const SUPPORT_NOTICES: SupportNotice[] = SUPPORT_NOTICES_SEED.map((n) => ({
  id: n.id,
  title: n.title,
  date: n.date,
  important: n.important,
  imageSrc: n.imageSrc,
  imageAlt: n.imageAlt,
  bodyHtml: n.bodyHtml,
}));

export async function getHubSupportNotices(): Promise<SupportNotice[]> {
  try {
    const records = await listHubSupportNotices();
    if (records.length > 0) return await Promise.all(records.map(toPublicNotice));
  } catch {
    /* fallback */
  }
  return SUPPORT_NOTICES;
}

export async function getSupportNotice(id: string): Promise<SupportNotice | undefined> {
  try {
    const record = await getSupportNoticeById(id);
    if (record) return toPublicNotice(record);
  } catch {
    /* fallback */
  }
  const fallback = SUPPORT_NOTICES.find((n) => n.id === id);
  if (!fallback) return undefined;
  const { sanitizeNoticeHtml } = await import("@/lib/security/sanitize-notice-html.server");
  return { ...fallback, bodyHtml: sanitizeNoticeHtml(fallback.bodyHtml) };
}
