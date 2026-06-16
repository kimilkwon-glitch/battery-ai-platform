import { NextResponse } from "next/server";
import { getVerifiedCustomerSessionFromRequest } from "@/lib/auth/customer-session.server";
import { isCustomerAuthConfigured } from "@/lib/auth/member-credentials";
import { operationalErrorResponse } from "@/lib/db/operational-api-errors";
import { inquiryList } from "@/lib/inquiry/inquiry-store";
import {
  authorViewCookieOptions,
  parseProductQnaViewerContext,
  qnaAuthorCookieName,
} from "@/lib/inquiry/product-qna-viewer.server";
import { submitProductQnaFromRequest } from "@/lib/inquiry/product-qna-submit.server";
import { toProductQnaPublicItem } from "@/lib/product-qna-public";
import { isProductQnaSource, type InquirySource } from "@/types/customer-inquiry";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const batteryCode = searchParams.get("battery")?.trim();
  const isPublic = searchParams.get("public") === "1";

  if (!batteryCode || !isPublic) {
    return NextResponse.json({ ok: false, message: "잘못된 요청입니다." }, { status: 400 });
  }

  try {
    const session = isCustomerAuthConfigured()
      ? await getVerifiedCustomerSessionFromRequest(request)
      : null;
    const viewer = parseProductQnaViewerContext(request, session?.userId ?? undefined);
    const records = await inquiryList({
      batteryCode,
      productQnaOnly: true,
      limit: 50,
    });
    const items = records.map((record) => toProductQnaPublicItem(record, viewer));
    return NextResponse.json({ ok: true, items });
  } catch (err) {
    return operationalErrorResponse(err, "문의 목록을 불러오지 못했습니다.", "inquiries");
  }
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const source = typeof body.source === "string" ? (body.source as InquirySource) : undefined;

  if (isProductQnaSource(source)) {
    try {
      const result = await submitProductQnaFromRequest(request, {
        message: String(body.message ?? ""),
        title: typeof body.title === "string" ? body.title : undefined,
        batteryCode: typeof body.batteryCode === "string" ? body.batteryCode : undefined,
        productCode: typeof body.productCode === "string" ? body.productCode : undefined,
        productName: typeof body.productName === "string" ? body.productName : undefined,
        pageUrl: typeof body.pageUrl === "string" ? body.pageUrl : undefined,
        source,
        inquiryType: typeof body.inquiryType === "string" ? body.inquiryType : undefined,
        category: body.category as import("@/types/customer-inquiry").InquiryCategory | undefined,
        isSecret: body.isSecret === true,
      });
      if (!result.ok) {
        return NextResponse.json({ ok: false, message: result.message }, { status: result.status });
      }
      const response = NextResponse.json({ ok: true, id: result.id });
      if (result.authorViewToken) {
        response.cookies.set(
          qnaAuthorCookieName(result.id),
          result.authorViewToken,
          authorViewCookieOptions(),
        );
      }
      return response;
    } catch (err) {
      return operationalErrorResponse(err, "문의 접수에 실패했습니다.", "inquiries");
    }
  }

  if (!String(body.message ?? "").trim()) {
    return NextResponse.json({ ok: false, message: "문의 내용을 입력해 주세요." }, { status: 400 });
  }
  if (!String(body.contact ?? "").trim()) {
    return NextResponse.json({ ok: false, message: "연락처를 입력해 주세요." }, { status: 400 });
  }

  try {
    const { inquiryCreate } = await import("@/lib/inquiry/inquiry-store");
    const item = await inquiryCreate({
      name: String(body.name ?? "고객"),
      contact: String(body.contact ?? ""),
      message: String(body.message ?? ""),
      title: typeof body.title === "string" ? body.title : undefined,
      batteryCode: typeof body.batteryCode === "string" ? body.batteryCode : undefined,
      productCode: typeof body.productCode === "string" ? body.productCode : undefined,
      productName: typeof body.productName === "string" ? body.productName : undefined,
      pageUrl: typeof body.pageUrl === "string" ? body.pageUrl : undefined,
      source,
      inquiryType: typeof body.inquiryType === "string" ? body.inquiryType : undefined,
      category: body.category as import("@/types/customer-inquiry").InquiryCategory | undefined,
      isSecret: body.isSecret === true,
    });
    return NextResponse.json({ ok: true, id: item.id });
  } catch (err) {
    return operationalErrorResponse(err, "문의 접수에 실패했습니다.", "inquiries");
  }
}
