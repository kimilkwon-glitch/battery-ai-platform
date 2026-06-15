import { NextResponse } from "next/server";
import { adminUnauthorizedResponse, verifyAdminApiRequest } from "@/lib/admin/adminApiAuth";
import {
  FaqAnswerEmptyError,
  softDeleteSupportFaqItem,
  updateSupportFaqItem,
  type SupportFaqInput,
} from "@/lib/support-faq-store";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await verifyAdminApiRequest(request))) {
    return NextResponse.json(adminUnauthorizedResponse(), { status: 401 });
  }
  const { id } = await params;
  let body: Partial<SupportFaqInput>;
  try {
    body = (await request.json()) as Partial<SupportFaqInput>;
  } catch {
    return NextResponse.json({ ok: false, message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }
  if (body.question !== undefined && !body.question.trim()) {
    return NextResponse.json({ ok: false, message: "질문을 입력해 주세요." }, { status: 400 });
  }
  if (body.answerText !== undefined && !body.answerText.trim()) {
    return NextResponse.json({ ok: false, message: "답변을 입력해 주세요." }, { status: 400 });
  }
  try {
    const item = await updateSupportFaqItem(id, body);
    if (!item) {
      return NextResponse.json({ ok: false, message: "FAQ를 찾을 수 없습니다." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, item });
  } catch (err) {
    if (err instanceof FaqAnswerEmptyError) {
      return NextResponse.json({ ok: false, message: "답변을 입력해 주세요." }, { status: 400 });
    }
    return NextResponse.json({ ok: false, message: "FAQ를 수정하지 못했습니다." }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await verifyAdminApiRequest(request))) {
    return NextResponse.json(adminUnauthorizedResponse(), { status: 401 });
  }
  const { id } = await params;
  try {
    const ok = await softDeleteSupportFaqItem(id);
    if (!ok) {
      return NextResponse.json({ ok: false, message: "FAQ를 찾을 수 없습니다." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, message: "FAQ를 삭제하지 못했습니다." }, { status: 500 });
  }
}
