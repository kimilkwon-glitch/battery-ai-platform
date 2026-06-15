import { NextResponse } from "next/server";
import { adminUnauthorizedResponse, verifyAdminApiRequest } from "@/lib/admin/adminApiAuth";
import { saveGuideUploadFile } from "@/lib/guide/guide-image-storage.server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!(await verifyAdminApiRequest(request))) {
    return NextResponse.json(adminUnauthorizedResponse(), { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, message: "잘못된 요청입니다." }, { status: 400 });
  }

  const entry = form.get("file");
  if (!(entry instanceof File) || entry.size === 0) {
    return NextResponse.json({ ok: false, message: "이미지 파일을 선택해 주세요." }, { status: 400 });
  }

  const buffer = Buffer.from(await entry.arrayBuffer());
  const mime = entry.type || "image/jpeg";
  const saved = await saveGuideUploadFile(buffer, mime);

  if (!saved.ok) {
    return NextResponse.json({ ok: false, message: saved.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, url: saved.url });
}
