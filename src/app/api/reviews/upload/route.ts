import { NextResponse } from "next/server";
import { resolveReviewWriteOrder } from "@/lib/reviews/review-write-access.server";
import { saveReviewUploadFile } from "@/lib/reviews/review-image-upload.server";
import { enforceIpRateLimitOrNull } from "@/lib/security/rate-limit-guard.server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const blocked = await enforceIpRateLimitOrNull(request, "reviews.upload", 20, 15 * 60 * 1000);
  if (blocked) return blocked;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, message: "잘못된 요청입니다." }, { status: 400 });
  }

  const orderId = String(form.get("orderId") ?? "").trim() || undefined;
  const orderNumber = String(form.get("orderNumber") ?? "").trim() || undefined;
  const contact = String(form.get("contact") ?? "").trim() || undefined;

  const access = await resolveReviewWriteOrder(request, { orderId, orderNumber, contact });
  if (!access.ok) {
    return NextResponse.json({ ok: false, message: access.message }, { status: access.status });
  }

  const entry = form.get("file");
  if (!(entry instanceof File) || entry.size === 0) {
    return NextResponse.json({ ok: false, message: "사진 파일을 선택해 주세요." }, { status: 400 });
  }

  const buffer = Buffer.from(await entry.arrayBuffer());
  const mime = entry.type || "image/jpeg";
  const saved = await saveReviewUploadFile(buffer, mime);

  if (!saved.ok) {
    return NextResponse.json(
      {
        ok: false,
        message: saved.message,
        storageStatus: "storageStatus" in saved ? saved.storageStatus : undefined,
      },
      { status: saved.storageStatus ? 503 : 400 },
    );
  }

  if ("dataUrl" in saved) {
    return NextResponse.json({
      ok: true,
      dataUrl: saved.dataUrl,
      storage: saved.storage,
    });
  }

  return NextResponse.json({ ok: true, url: saved.url, storage: saved.storage });
}
