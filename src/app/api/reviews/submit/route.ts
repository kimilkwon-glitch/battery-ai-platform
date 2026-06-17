import { NextResponse } from "next/server";
import { getVerifiedCustomerSessionFromRequest } from "@/lib/auth/customer-session.server";
import { createCustomerReview, reviewExistsForOrder } from "@/lib/cms/customer-review-store.postgres";
import { isPostgresConfigured } from "@/lib/db/postgres";
import { batterySpecHref } from "@/lib/canonical-battery-code";
import {
  normalizeReviewImages,
  reviewPrimaryImageUrl,
} from "@/lib/reviews/review-image-policy";
import { resolveReviewWriteOrder } from "@/lib/reviews/review-write-access.server";
import { enforceIpRateLimitOrNull } from "@/lib/security/rate-limit-guard.server";

export const dynamic = "force-dynamic";

const ELIGIBLE_STATUSES = new Set(["completed", "payment_completed", "shipping"]);

type SubmitBody = {
  orderId?: string;
  orderNumber?: string;
  contact?: string;
  rating?: number;
  title?: string;
  body?: string;
  vehicleName?: string;
  serviceType?: string;
  batteryCode?: string;
  images?: string[];
  consent?: boolean;
};

export async function POST(request: Request) {
  if (!isPostgresConfigured()) {
    return NextResponse.json(
      { ok: false, message: "후기 접수를 준비 중입니다. 잠시 후 다시 시도해 주세요." },
      { status: 503 },
    );
  }

  const blocked = await enforceIpRateLimitOrNull(request, "reviews.submit", 10, 15 * 60 * 1000);
  if (blocked) return blocked;

  let body: SubmitBody;
  try {
    body = (await request.json()) as SubmitBody;
  } catch {
    return NextResponse.json({ ok: false, message: "잘못된 요청입니다." }, { status: 400 });
  }

  if (!body.consent) {
    return NextResponse.json({ ok: false, message: "공개 동의가 필요합니다." }, { status: 400 });
  }
  if (!body.body?.trim() || !body.title?.trim()) {
    return NextResponse.json({ ok: false, message: "제목과 후기 내용을 입력해 주세요." }, { status: 400 });
  }
  const rating = Math.min(5, Math.max(1, Math.floor(body.rating ?? 5)));

  const session = await getVerifiedCustomerSessionFromRequest(request);
  const access = await resolveReviewWriteOrder(request, {
    orderId: body.orderId,
    orderNumber: body.orderNumber,
    contact: body.contact,
  });
  if (!access.ok) {
    return NextResponse.json({ ok: false, message: access.message }, { status: access.status });
  }
  const order = access.order;
  const orderId = order.orderId;
  let authorName = order.customerName?.trim() || "고객";
  const userId = session?.userId;

  if (!ELIGIBLE_STATUSES.has(order.orderStatus)) {
    return NextResponse.json(
      { ok: false, message: "완료된 주문만 후기를 작성할 수 있습니다." },
      { status: 400 },
    );
  }

  if (await reviewExistsForOrder(order.orderId)) {
    return NextResponse.json({ ok: false, message: "이미 작성한 후기가 있습니다." }, { status: 409 });
  }

  const images = normalizeReviewImages(body.images);
  const batteryCode = body.batteryCode?.trim() || order.batteryCode;
  const review = await createCustomerReview({
    authorName,
    vehicleName: body.vehicleName?.trim() || order.vehicleName || null,
    serviceType: body.serviceType?.trim() || order.fulfillmentType || null,
    batteryCode,
    rating,
    content: body.body.trim(),
    summary: body.title.trim(),
    images,
    imageUrl: reviewPrimaryImageUrl(images),
    status: "pending",
    reviewSource: "own_store",
    orderId: order.orderId,
    userId: userId ?? order.userId ?? null,
    productHref: batteryCode ? batterySpecHref(batteryCode) : null,
    showOnMain: false,
  });

  return NextResponse.json({ ok: true, id: review.id, status: review.status });
}
