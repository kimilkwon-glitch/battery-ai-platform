import { redirect } from "next/navigation";
import { batteryDetailHref } from "@/lib/canonical-battery-code";

type Props = {
  searchParams: Promise<{ code?: string; q?: string }>;
};

/** 고객 쇼핑 페이지 비노출 — 차량/규격 검색으로 안내 */
export default async function ShopPage({ searchParams }: Props) {
  const params = await searchParams;
  const code = params.code?.trim();
  if (code) {
    redirect(batteryDetailHref(code));
  }
  const q = params.q?.trim();
  if (q) {
    redirect(`/search?q=${encodeURIComponent(q)}`);
  }
  redirect("/search");
}
