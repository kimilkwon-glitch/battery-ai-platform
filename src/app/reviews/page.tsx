import { redirect } from "next/navigation";
import { batteryProductDetailHref } from "@/lib/battery-product-routes";
import { canonicalBatteryCode } from "@/lib/canonical-battery-code";
import { HUB_VEHICLES } from "@/lib/customer-hub-routes";

/** 리뷰 모아보기 — 상품 상세 #battery-reviews 로 안내 (목록 페이지 미사용) */
export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ battery?: string }>;
}) {
  const { battery } = await searchParams;
  const raw = battery?.trim();
  if (raw) {
    const code = canonicalBatteryCode(raw) || raw.toUpperCase();
    for (const brand of ["rocket", "solite"] as const) {
      const product = batteryProductDetailHref(brand, code);
      if (product) redirect(`${product}#battery-reviews`);
    }
  }
  redirect(HUB_VEHICLES);
}
