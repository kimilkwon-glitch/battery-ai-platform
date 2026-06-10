import { NextResponse } from "next/server";
import { operationalErrorResponse } from "@/lib/db/operational-api-errors";
import { inquiryCreate, inquiryList, type InquiryCreateInput } from "@/lib/inquiry/inquiry-store";
import { toProductQnaPublicItem } from "@/lib/product-qna-public";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const batteryCode = searchParams.get("battery")?.trim();
  const isPublic = searchParams.get("public") === "1";

  if (!batteryCode || !isPublic) {
    return NextResponse.json({ ok: false, message: "잘못된 요청입니다." }, { status: 400 });
  }

  try {
    const records = await inquiryList({
      batteryCode,
      productQnaOnly: true,
      limit: 50,
    });
    const items = records.map(toProductQnaPublicItem);
    return NextResponse.json({ ok: true, items });
  } catch (err) {
    return operationalErrorResponse(err, "문의 목록을 불러오지 못했습니다.", "inquiries");
  }
}

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
  } catch (err) {
    return operationalErrorResponse(err, "문의 접수에 실패했습니다.", "inquiries");
  }
}
