import { NextResponse } from "next/server";
import { adminUnauthorizedResponse, verifyAdminApiRequest } from "@/lib/admin/adminApiAuth";
import {
  createSupportNotice,
  listAllSupportNotices,
  NoticeBodyEmptyError,
  type SupportNoticeInput,
} from "@/lib/support-notices-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await verifyAdminApiRequest(request))) {
    return NextResponse.json(adminUnauthorizedResponse(), { status: 401 });
  }
  try {
    const items = await listAllSupportNotices();
    return NextResponse.json({ ok: true, items });
  } catch {
    return NextResponse.json({ ok: false, message: "공지 목록을 불러오지 못했습니다." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await verifyAdminApiRequest(request))) {
    return NextResponse.json(adminUnauthorizedResponse(), { status: 401 });
  }
  let body: SupportNoticeInput;
  try {
    body = (await request.json()) as SupportNoticeInput;
  } catch {
    return NextResponse.json({ ok: false, message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }
  if (!body.title?.trim()) {
    return NextResponse.json({ ok: false, message: "제목을 입력해 주세요." }, { status: 400 });
  }
  if (!body.date?.trim()) {
    return NextResponse.json({ ok: false, message: "작성일을 입력해 주세요." }, { status: 400 });
  }
  if (!body.bodyHtml?.trim()) {
    return NextResponse.json({ ok: false, message: "본문을 입력해 주세요." }, { status: 400 });
  }
  try {
    const item = await createSupportNotice(body);
    return NextResponse.json({ ok: true, item });
  } catch (err) {
    if (err instanceof NoticeBodyEmptyError) {
      return NextResponse.json({ ok: false, message: "본문을 입력해 주세요." }, { status: 400 });
    }
    return NextResponse.json({ ok: false, message: "공지를 저장하지 못했습니다." }, { status: 500 });
  }
}
