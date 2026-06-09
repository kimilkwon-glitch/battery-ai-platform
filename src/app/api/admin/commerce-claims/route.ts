import { NextResponse } from "next/server";
import { adminUnauthorizedResponse, verifyAdminApiRequest } from "@/lib/admin/adminApiAuth";
import { claimList, claimListByOrderId } from "@/lib/claims/claim-store";
import type { ClaimStatus, ClaimType } from "@/types/commerce-claim";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await verifyAdminApiRequest(request))) {
    return NextResponse.json(adminUnauthorizedResponse(), { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const claimType = searchParams.get("type") as ClaimType | "all" | null;
  const claimStatus = searchParams.get("status") as ClaimStatus | "all" | null;
  const q = searchParams.get("q");
  const orderId = searchParams.get("orderId");

  try {
    if (orderId?.trim()) {
      const claims = await claimListByOrderId(orderId.trim());
      return NextResponse.json({ ok: true, items: claims, claims });
    }
    const items = await claimList({ claimType, claimStatus, q, orderId, limit: 500 });
    return NextResponse.json({ ok: true, items });
  } catch {
    return NextResponse.json({ ok: false, message: "목록을 불러오지 못했습니다." }, { status: 500 });
  }
}
