import { NextResponse } from "next/server";
import { adminUnauthorizedResponse, verifyAdminApiRequest } from "@/lib/admin/adminApiAuth";
import {
  inquiryGetById,
  inquirySetHidden,
  inquiryUpdateMemo,
  inquiryUpdateStatus,
} from "@/lib/inquiry/inquiry-store";
import type { InquiryStatus } from "@/types/customer-inquiry";

export const dynamic = "force-dynamic";

type RouteCtx = { params: Promise<{ id: string }> };

export async function GET(request: Request, ctx: RouteCtx) {
  if (!(await verifyAdminApiRequest(request))) {
    return NextResponse.json(adminUnauthorizedResponse(), { status: 401 });
  }
  const { id } = await ctx.params;
  try {
    const item = await inquiryGetById(id);
    if (!item) {
      return NextResponse.json({ ok: false, message: "문의를 찾을 수 없습니다." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, item });
  } catch {
    return NextResponse.json({ ok: false, message: "문의를 불러오지 못했습니다." }, { status: 500 });
  }
}

export async function PATCH(request: Request, ctx: RouteCtx) {
  if (!(await verifyAdminApiRequest(request))) {
    return NextResponse.json(adminUnauthorizedResponse(), { status: 401 });
  }

  const { id } = await ctx.params;
  let body: { status?: InquiryStatus; adminMemo?: string; hidden?: boolean };
  try {
    body = (await request.json()) as { status?: InquiryStatus; adminMemo?: string; hidden?: boolean };
  } catch {
    return NextResponse.json({ ok: false, message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  try {
    if (body.hidden !== undefined) {
      const item = await inquirySetHidden(id, body.hidden);
      if (!item) {
        return NextResponse.json({ ok: false, message: "문의를 찾을 수 없습니다." }, { status: 404 });
      }
      return NextResponse.json({ ok: true, item });
    }
    if (body.adminMemo !== undefined) {
      const item = await inquiryUpdateMemo(id, body.adminMemo);
      if (!item) {
        return NextResponse.json({ ok: false, message: "문의를 찾을 수 없습니다." }, { status: 404 });
      }
      if (body.status) {
        const withStatus = await inquiryUpdateStatus(id, body.status);
        return NextResponse.json({ ok: true, item: withStatus ?? item });
      }
      return NextResponse.json({ ok: true, item });
    }
    if (body.status) {
      const item = await inquiryUpdateStatus(id, body.status);
      if (!item) {
        return NextResponse.json({ ok: false, message: "문의를 찾을 수 없습니다." }, { status: 404 });
      }
      return NextResponse.json({ ok: true, item });
    }
    return NextResponse.json({ ok: false, message: "변경할 항목이 없습니다." }, { status: 400 });
  } catch {
    return NextResponse.json({ ok: false, message: "저장에 실패했습니다." }, { status: 500 });
  }
}
