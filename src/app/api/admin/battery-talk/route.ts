import { NextResponse } from "next/server";
import { adminUnauthorizedResponse, verifyAdminApiRequest } from "@/lib/admin/adminApiAuth";
import { batteryTalkErrorResponse, batteryTalkStoreStatusPayload } from "@/lib/battery-talk/battery-talk-api-errors";
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
  const includeTestData = searchParams.get("dataScope") === "test";

  try {
    const items = await batteryTalkList({ status, q, limit: 500, includeTestData });
    return NextResponse.json({ ok: true, items, ...batteryTalkStoreStatusPayload() });
  } catch (err) {
    return batteryTalkErrorResponse(err, "상담 목록을 불러오지 못했습니다.");
  }
}
