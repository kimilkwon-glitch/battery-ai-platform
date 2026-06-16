import "server-only";

import { getVerifiedCustomerSessionFromRequest } from "@/lib/auth/customer-session.server";
import { getMemberStore } from "@/lib/auth/member-store";
import { isCustomerAuthConfigured } from "@/lib/auth/member-credentials";
import { isOperationalDbMode } from "@/lib/db/operational-store-config";
import { inquiryCreate, type InquiryCreateInput } from "@/lib/inquiry/inquiry-store";
import {
  createAuthorViewToken,
  hashAuthorViewToken,
} from "@/lib/inquiry/product-qna-viewer.server";
import { isProductQnaSource } from "@/types/customer-inquiry";

export type ProductQnaSubmitBody = {
  message: string;
  title?: string;
  batteryCode?: string;
  productCode?: string;
  productName?: string;
  pageUrl?: string;
  source?: InquiryCreateInput["source"];
  inquiryType?: string;
  category?: InquiryCreateInput["category"];
  isSecret?: boolean;
};

export type ProductQnaSubmitResult =
  | { ok: true; id: string; authorViewToken?: string }
  | { ok: false; status: number; message: string };

async function resolveMemberContact(userId: string): Promise<{ name: string; contact: string }> {
  if (!isOperationalDbMode()) {
    return { name: "고객", contact: "" };
  }
  const store = await getMemberStore();
  const member = await store.findMemberById(userId);
  if (!member) return { name: "고객", contact: "" };
  return {
    name: member.name?.trim() || "고객",
    contact: member.phone?.trim() || "",
  };
}

export async function submitProductQnaFromRequest(
  request: Request,
  body: ProductQnaSubmitBody,
): Promise<ProductQnaSubmitResult> {
  if (!body.message?.trim()) {
    return { ok: false, status: 400, message: "문의 내용을 입력해 주세요." };
  }

  const batteryCode = body.batteryCode?.trim() || body.productCode?.trim();
  if (!batteryCode) {
    return { ok: false, status: 400, message: "상품 정보가 올바르지 않습니다." };
  }

  const session = isCustomerAuthConfigured()
    ? await getVerifiedCustomerSessionFromRequest(request)
    : null;
  let authorUserId: string | undefined;
  let authorViewTokenHash: string | undefined;
  let authorViewToken: string | undefined;
  let name = "고객";
  let contact = "";

  if (session?.userId) {
    authorUserId = session.userId;
    const memberInfo = await resolveMemberContact(session.userId);
    name = memberInfo.name;
    contact = memberInfo.contact;
  } else {
    authorViewToken = createAuthorViewToken();
    authorViewTokenHash = hashAuthorViewToken(authorViewToken);
  }

  const source = isProductQnaSource(body.source) ? body.source : "product_qna";

  const record = await inquiryCreate({
    name,
    contact,
    message: body.message.trim(),
    title: body.title?.trim(),
    batteryCode,
    productCode: body.productCode?.trim() || batteryCode,
    productName: body.productName?.trim(),
    pageUrl: body.pageUrl?.trim(),
    source,
    inquiryType: body.inquiryType?.trim() || "상품문의",
    category: body.category ?? "battery",
    isSecret: body.isSecret === true,
    authorUserId,
    authorViewTokenHash,
  });

  return { ok: true, id: record.id, authorViewToken };
}
