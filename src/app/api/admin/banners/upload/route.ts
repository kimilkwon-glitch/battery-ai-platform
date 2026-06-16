import { NextResponse } from "next/server";
import { adminUnauthorizedResponse, verifyAdminApiRequest } from "@/lib/admin/adminApiAuth";
import {
  isFormDataFile,
  readUploadFile,
} from "@/lib/cms/blob-storage-auth.server";
import { saveBannerUploadFile } from "@/lib/cms/banner-image-storage.server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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
  if (!isFormDataFile(entry)) {
    return NextResponse.json({ ok: false, message: "이미지 파일을 선택해 주세요." }, { status: 400 });
  }

  const { buffer, mime } = await readUploadFile(entry);
  const saved = await saveBannerUploadFile(buffer, mime);

  if (!saved.ok) {
    return NextResponse.json(
      { ok: false, message: saved.message, code: saved.logCode },
      { status: saved.status },
    );
  }

  return NextResponse.json({
    ok: true,
    url: saved.url,
    pathname: saved.pathname,
    contentType: mime,
    size: buffer.byteLength,
  });
}
