import { NextResponse } from "next/server";
import { adminUnauthorizedResponse, verifyAdminApiRequest } from "@/lib/admin/adminApiAuth";
import { enrichBatteryTalkThread } from "@/lib/battery-talk/battery-talk-enrichment";
import {
  batteryTalkGetById,
  batteryTalkUpdateMemo,
  batteryTalkUpdateStatus,
} from "@/lib/battery-talk/battery-talk-store";
import type { BatteryTalkThreadStatus } from "@/types/battery-talk";

export const dynamic = "force-dynamic";

type RouteCtx = { params: Promise<{ threadId: string }> };

export async function GET(request: Request, ctx: RouteCtx) {
  if (!(await verifyAdminApiRequest(request))) {
    return NextResponse.json(adminUnauthorizedResponse(), { status: 401 });
  }
  const { threadId } = await ctx.params;
  try {
    const thread = await batteryTalkGetById(threadId);
    if (!thread) {
      return NextResponse.json({ ok: false, message: "상담을 찾을 수 없습니다." }, { status: 404 });
    }
    const detail = await enrichBatteryTalkThread(thread);
    return NextResponse.json({ ok: true, ...detail });
  } catch {
    return NextResponse.json({ ok: false, message: "상담을 불러오지 못했습니다." }, { status: 500 });
  }
}

export async function PATCH(request: Request, ctx: RouteCtx) {
  if (!(await verifyAdminApiRequest(request))) {
    return NextResponse.json(adminUnauthorizedResponse(), { status: 401 });
  }

  const { threadId } = await ctx.params;
  let body: { status?: BatteryTalkThreadStatus; adminMemo?: string };
  try {
    body = (await request.json()) as { status?: BatteryTalkThreadStatus; adminMemo?: string };
  } catch {
    return NextResponse.json({ ok: false, message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  try {
    if (body.adminMemo !== undefined) {
      const thread = await batteryTalkUpdateMemo(threadId, body.adminMemo);
      if (!thread) {
        return NextResponse.json({ ok: false, message: "상담을 찾을 수 없습니다." }, { status: 404 });
      }
      if (body.status) {
        const withStatus = await batteryTalkUpdateStatus(threadId, body.status);
        const detail = await enrichBatteryTalkThread(withStatus ?? thread);
        return NextResponse.json({ ok: true, ...detail });
      }
      const detail = await enrichBatteryTalkThread(thread);
      return NextResponse.json({ ok: true, ...detail });
    }
    if (body.status) {
      const thread = await batteryTalkUpdateStatus(threadId, body.status);
      if (!thread) {
        return NextResponse.json({ ok: false, message: "상담을 찾을 수 없습니다." }, { status: 404 });
      }
      const detail = await enrichBatteryTalkThread(thread);
      return NextResponse.json({ ok: true, ...detail });
    }
    return NextResponse.json({ ok: false, message: "변경할 항목이 없습니다." }, { status: 400 });
  } catch {
    return NextResponse.json({ ok: false, message: "저장에 실패했습니다." }, { status: 500 });
  }
}
