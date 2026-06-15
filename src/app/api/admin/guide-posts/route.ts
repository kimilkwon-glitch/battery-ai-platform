import { NextResponse } from "next/server";
import { adminUnauthorizedResponse, verifyAdminApiRequest } from "@/lib/admin/adminApiAuth";
import {
  createGuidePost,
  GuideBodyEmptyError,
  listAllGuidePosts,
  type GuidePostInput,
} from "@/lib/guide-posts-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await verifyAdminApiRequest(request))) {
    return NextResponse.json(adminUnauthorizedResponse(), { status: 401 });
  }
  try {
    const items = await listAllGuidePosts();
    return NextResponse.json({ ok: true, items });
  } catch {
    return NextResponse.json({ ok: false, message: "가이드 목록을 불러오지 못했습니다." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await verifyAdminApiRequest(request))) {
    return NextResponse.json(adminUnauthorizedResponse(), { status: 401 });
  }
  let body: GuidePostInput;
  try {
    body = (await request.json()) as GuidePostInput;
  } catch {
    return NextResponse.json({ ok: false, message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }
  if (!body.title?.trim()) {
    return NextResponse.json({ ok: false, message: "제목을 입력해 주세요." }, { status: 400 });
  }
  if (!body.category) {
    return NextResponse.json({ ok: false, message: "카테고리를 선택해 주세요." }, { status: 400 });
  }
  if (!body.bodyHtml?.trim()) {
    return NextResponse.json({ ok: false, message: "본문을 입력해 주세요." }, { status: 400 });
  }
  try {
    const item = await createGuidePost(body);
    return NextResponse.json({ ok: true, item });
  } catch (err) {
    if (err instanceof GuideBodyEmptyError) {
      return NextResponse.json({ ok: false, message: "본문을 입력해 주세요." }, { status: 400 });
    }
    return NextResponse.json({ ok: false, message: "가이드를 저장하지 못했습니다." }, { status: 500 });
  }
}
