import { NextResponse } from "next/server";
import { adminUnauthorizedResponse, verifyAdminApiRequest } from "@/lib/admin/adminApiAuth";
import {
  NoticeBodyEmptyError,
  updateSupportNotice,
  type SupportNoticeInput,
} from "@/lib/support-notices-store";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await verifyAdminApiRequest(request))) {
    return NextResponse.json(adminUnauthorizedResponse(), { status: 401 });
  }
  const { id } = await params;
  let body: Partial<SupportNoticeInput>;
  try {
    body = (await request.json()) as Partial<SupportNoticeInput>;
  } catch {
    return NextResponse.json({ ok: false, message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }
  if (body.title !== undefined && !body.title.trim()) {
    return NextResponse.json({ ok: false, message: "제목을 입력해 주세요." }, { status: 400 });
  }
  if (body.bodyHtml !== undefined && !body.bodyHtml.trim()) {
    return NextResponse.json({ ok: false, message: "본문을 입력해 주세요." }, { status: 400 });
  }
  try {
    const item = await updateSupportNotice(id, body);
    if (!item) {
      return NextResponse.json({ ok: false, message: "공지를 찾을 수 없습니다." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, item });
  } catch (err) {
    if (err instanceof NoticeBodyEmptyError) {
      return NextResponse.json({ ok: false, message: "본문을 입력해 주세요." }, { status: 400 });
    }
    return NextResponse.json({ ok: false, message: "공지를 수정하지 못했습니다." }, { status: 500 });
  }
}
