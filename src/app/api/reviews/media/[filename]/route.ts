import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { resolveReviewUploadPath } from "@/lib/reviews/review-image-upload.server";

export const dynamic = "force-dynamic";

const MIME_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

type RouteContext = { params: Promise<{ filename: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { filename } = await context.params;
  const filePath = resolveReviewUploadPath(filename);
  if (!filePath) {
    return NextResponse.json({ ok: false, message: "Not found" }, { status: 404 });
  }

  try {
    const buffer = await readFile(filePath);
    const ext = filename.split(".").pop()?.toLowerCase() ?? "jpg";
    const contentType = MIME_BY_EXT[ext] ?? "application/octet-stream";
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ ok: false, message: "Not found" }, { status: 404 });
  }
}
