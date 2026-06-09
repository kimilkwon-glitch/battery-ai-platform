import { NextResponse } from "next/server";
import { adminUnauthorizedResponse, verifyAdminApiRequest } from "@/lib/admin/adminApiAuth";
import { batteryTalkList } from "@/lib/battery-talk/battery-talk-store";
import type { BatteryTalkThreadStatus } from "@/types/battery-talk";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await verifyAdminApiRequest(request))) {
    return NextResponse.json(adminUnauthorizedResponse(), { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as BatteryTalkThreadStatus | "all" | null;
  const q = searchParams.get("q");

  try {
    const items = await batteryTalkList({ status, q, limit: 500 });
    return NextResponse.json({ ok: true, items });
  } catch {
    return NextResponse.json({ ok: false, message: "상담 목록을 불러오지 못했습니다." }, { status: 500 });
  }
}
