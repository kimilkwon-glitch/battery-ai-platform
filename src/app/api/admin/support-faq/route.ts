import { NextResponse } from "next/server";
import { adminUnauthorizedResponse, verifyAdminApiRequest } from "@/lib/admin/adminApiAuth";
import {
  createSupportFaqItem,
  FaqAnswerEmptyError,
  listAllSupportFaqItems,
  type SupportFaqInput,
} from "@/lib/support-faq-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await verifyAdminApiRequest(request))) {
    return NextResponse.json(adminUnauthorizedResponse(), { status: 401 });
  }
  try {
    const items = await listAllSupportFaqItems();
    return NextResponse.json({ ok: true, items });
  } catch {
    return NextResponse.json({ ok: false, message: "FAQ 목록을 불러오지 못했습니다." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await verifyAdminApiRequest(request))) {
    return NextResponse.json(adminUnauthorizedResponse(), { status: 401 });
  }
  let body: SupportFaqInput;
  try {
    body = (await request.json()) as SupportFaqInput;
  } catch {
    return NextResponse.json({ ok: false, message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }
  if (!body.question?.trim()) {
    return NextResponse.json({ ok: false, message: "질문을 입력해 주세요." }, { status: 400 });
  }
  if (!body.category) {
    return NextResponse.json({ ok: false, message: "카테고리를 선택해 주세요." }, { status: 400 });
  }
  if (!body.answerText?.trim()) {
    return NextResponse.json({ ok: false, message: "답변을 입력해 주세요." }, { status: 400 });
  }
  try {
    const item = await createSupportFaqItem(body);
    return NextResponse.json({ ok: true, item });
  } catch (err) {
    if (err instanceof FaqAnswerEmptyError) {
      return NextResponse.json({ ok: false, message: "답변을 입력해 주세요." }, { status: 400 });
    }
    return NextResponse.json({ ok: false, message: "FAQ를 저장하지 못했습니다." }, { status: 500 });
  }
}
