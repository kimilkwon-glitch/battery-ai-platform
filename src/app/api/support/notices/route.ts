import { NextResponse } from "next/server";
import { listHubSupportNotices } from "@/lib/support-notices-store";
import { sanitizeNoticeHtml } from "@/lib/security/sanitize-notice-html.server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await listHubSupportNotices();
    const safeItems = items.map((item) => ({
      ...item,
      bodyHtml: sanitizeNoticeHtml(item.bodyHtml),
    }));
    return NextResponse.json({ ok: true, items: safeItems });
  } catch {
    return NextResponse.json({ ok: false, message: "공지를 불러오지 못했습니다." }, { status: 500 });
  }
}
