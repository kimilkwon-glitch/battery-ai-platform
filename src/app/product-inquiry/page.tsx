import { Suspense } from "react";
import { ProductPriceInquiryClient } from "@/components/inquiry/ProductPriceInquiryClient";

export const metadata = {
  title: "상품 가격 문의 | 배터리매니저",
  description: "선택하신 배터리 상품의 가격을 문의하세요.",
};

export default function ProductInquiryPage() {
  return (
    <main className="min-h-[60vh] bg-slate-50">
      <Suspense fallback={<p className="p-8 text-center text-sm text-slate-500">불러오는 중…</p>}>
        <ProductPriceInquiryClient />
      </Suspense>
    </main>
  );
}
