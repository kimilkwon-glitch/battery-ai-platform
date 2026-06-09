import { NextResponse } from "next/server";
import { listHubSupportNotices } from "@/lib/support-notices-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await listHubSupportNotices();
    return NextResponse.json({ ok: true, items });
  } catch {
    return NextResponse.json({ ok: false, message: "공지를 불러오지 못했습니다." }, { status: 500 });
  }
}
