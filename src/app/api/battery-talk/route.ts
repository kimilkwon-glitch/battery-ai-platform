import { NextResponse } from "next/server";
import { inferBatteryTalkPageType } from "@/lib/battery-talk/battery-talk-context";
import { batteryTalkCreate } from "@/lib/battery-talk/battery-talk-store";
import type { BatteryTalkContext } from "@/types/battery-talk";

export const dynamic = "force-dynamic";

type PostBody = {
  customerName?: string;
  phone?: string;
  message?: string;
  userId?: string;
  isMember?: boolean;
  context?: BatteryTalkContext;
};

export async function POST(request: Request) {
  let body: PostBody;
  try {
    body = (await request.json()) as PostBody;
  } catch {
    return NextResponse.json({ ok: false, message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  if (!body.message?.trim()) {
    return NextResponse.json({ ok: false, message: "문의 내용을 입력해 주세요." }, { status: 400 });
  }
  if (!body.phone?.trim()) {
    return NextResponse.json({ ok: false, message: "연락처를 입력해 주세요." }, { status: 400 });
  }

  const context: BatteryTalkContext = {
    ...body.context,
    pageType: body.context?.pageType ?? inferBatteryTalkPageType(body.context?.pageUrl),
  };

  try {
    const thread = await batteryTalkCreate({
      customerName: body.customerName?.trim() || "고객",
      phone: body.phone.trim(),
      message: body.message.trim(),
      userId: body.userId,
      isMember: body.isMember,
      context,
    });
    return NextResponse.json({ ok: true, threadId: thread.threadId });
  } catch {
    return NextResponse.json({ ok: false, message: "상담 접수에 실패했습니다." }, { status: 500 });
  }
}
