import { NextResponse } from "next/server";
import { adminUnauthorizedResponse, verifyAdminApiRequest } from "@/lib/admin/adminApiAuth";
import {
  deleteBatteryTalkReplyTemplate,
  listBatteryTalkReplyTemplates,
  saveBatteryTalkReplyTemplates,
  upsertBatteryTalkReplyTemplate,
} from "@/lib/admin/battery-talk-reply-templates-store.json";
import type { BatteryTalkReplyTemplate } from "@/types/battery-talk-reply-template";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await verifyAdminApiRequest(request))) {
    return NextResponse.json(adminUnauthorizedResponse(), { status: 401 });
  }
  const templates = await listBatteryTalkReplyTemplates();
  return NextResponse.json({ ok: true, templates });
}

export async function POST(request: Request) {
  if (!(await verifyAdminApiRequest(request))) {
    return NextResponse.json(adminUnauthorizedResponse(), { status: 401 });
  }
  let body: Partial<BatteryTalkReplyTemplate> & { name?: string; body?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }
  if (!body.name?.trim() || !body.body?.trim()) {
    return NextResponse.json({ ok: false, message: "템플릿명과 내용을 입력해 주세요." }, { status: 400 });
  }
  const templates = await upsertBatteryTalkReplyTemplate({
    id: body.id,
    name: body.name,
    body: body.body,
    category: body.category,
    enabled: body.enabled,
    sortOrder: body.sortOrder,
  });
  return NextResponse.json({ ok: true, templates });
}

export async function PUT(request: Request) {
  if (!(await verifyAdminApiRequest(request))) {
    return NextResponse.json(adminUnauthorizedResponse(), { status: 401 });
  }
  let body: { templates?: BatteryTalkReplyTemplate[] };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }
  if (!body.templates?.length) {
    return NextResponse.json({ ok: false, message: "저장할 템플릿이 없습니다." }, { status: 400 });
  }
  const templates = await saveBatteryTalkReplyTemplates(body.templates);
  return NextResponse.json({ ok: true, templates });
}

export async function DELETE(request: Request) {
  if (!(await verifyAdminApiRequest(request))) {
    return NextResponse.json(adminUnauthorizedResponse(), { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ ok: false, message: "삭제할 템플릿 ID가 필요합니다." }, { status: 400 });
  }
  const templates = await deleteBatteryTalkReplyTemplate(id);
  return NextResponse.json({ ok: true, templates });
}
