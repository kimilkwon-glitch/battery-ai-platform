import { NextResponse } from "next/server";
import { inquiryCreate, type InquiryCreateInput } from "@/lib/inquiry/inquiry-store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: InquiryCreateInput;
  try {
    body = (await request.json()) as InquiryCreateInput;
  } catch {
    return NextResponse.json({ ok: false, message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  if (!body.message?.trim()) {
    return NextResponse.json({ ok: false, message: "문의 내용을 입력해 주세요." }, { status: 400 });
  }
  if (!body.contact?.trim()) {
    return NextResponse.json({ ok: false, message: "연락처를 입력해 주세요." }, { status: 400 });
  }

  try {
    const item = await inquiryCreate(body);
    return NextResponse.json({ ok: true, id: item.id });
  } catch {
    return NextResponse.json({ ok: false, message: "문의 접수에 실패했습니다." }, { status: 500 });
  }
}
