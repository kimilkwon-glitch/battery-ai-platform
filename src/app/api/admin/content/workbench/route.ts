import { NextResponse } from "next/server";
import { adminUnauthorizedResponse, verifyAdminApiRequest } from "@/lib/admin/adminApiAuth";
import {
  loadContentWorkbenchItems,
  saveContentWorkbenchItems,
} from "@/lib/admin/content-workbench-store";
import type { AdminContentItem } from "@/data/admin/adminContent.schema";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await verifyAdminApiRequest(request))) {
    return NextResponse.json(adminUnauthorizedResponse(), { status: 401 });
  }
  try {
    const items = await loadContentWorkbenchItems();
    return NextResponse.json({ ok: true, items, source: "persisted" });
  } catch {
    return NextResponse.json({ ok: false, message: "콘텐츠를 불러오지 못했습니다." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!(await verifyAdminApiRequest(request))) {
    return NextResponse.json(adminUnauthorizedResponse(), { status: 401 });
  }
  let body: { items?: AdminContentItem[] };
  try {
    body = (await request.json()) as { items?: AdminContentItem[] };
  } catch {
    return NextResponse.json({ ok: false, message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }
  if (!Array.isArray(body.items)) {
    return NextResponse.json({ ok: false, message: "items 배열이 필요합니다." }, { status: 400 });
  }
  for (const item of body.items) {
    if (!item.id?.trim() || !item.title?.trim()) {
      return NextResponse.json({ ok: false, message: "id와 title은 필수입니다." }, { status: 400 });
    }
  }
  try {
    const items = await saveContentWorkbenchItems(body.items);
    return NextResponse.json({ ok: true, items });
  } catch {
    return NextResponse.json({ ok: false, message: "저장에 실패했습니다." }, { status: 500 });
  }
}
