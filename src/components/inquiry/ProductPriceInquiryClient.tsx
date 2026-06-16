"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { SimpleInquiryForm, type SimpleInquiryFormValues } from "@/components/inquiry/SimpleInquiryForm";
import { getInquiryPageUrl, inquiryTitleFromMessage } from "@/lib/inquiry/inquiry-form-shared";
import { submitInquiry } from "@/lib/inquiry-storage";
import "@/styles/product-price-inquiry.css";

function buildDefaultMessage(brand: string, spec: string): string {
  const label = [brand, spec].filter(Boolean).join(" ").trim() || spec;
  return `[상품 가격 문의] ${label} 제품 가격을 문의합니다.`;
}

export function ProductPriceInquiryClient() {
  const router = useRouter();
  const params = useSearchParams();
  const productCode = params.get("productCode")?.trim() ?? "";
  const productName = params.get("productName")?.trim() || productCode;
  const brand = params.get("brand")?.trim() ?? "";
  const sourceUrl = params.get("sourceUrl")?.trim() ?? "";

  const initialMessage = useMemo(
    () => buildDefaultMessage(brand, productName || productCode),
    [brand, productName, productCode],
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async (values: SimpleInquiryFormValues) => {
    setError(null);
    setSubmitting(true);
    const title = values.title?.trim() || inquiryTitleFromMessage(values.message);
    const result = await submitInquiry({
      name: values.name?.trim() || "고객",
      contact: values.contact.trim(),
      title,
      message: values.message.trim(),
      batteryCode: productCode || undefined,
      productCode: productCode || undefined,
      productName: productName || undefined,
      pageUrl: sourceUrl || getInquiryPageUrl(),
      source: "product_qna",
      inquiryType: "가격문의",
      category: "battery",
    });
    setSubmitting(false);
    if (result.ok) {
      setDone(true);
    } else {
      setError("문의 접수에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    }
  };

  return (
    <div className="product-price-inquiry">
      <div className="product-price-inquiry__inner">
        <button
          type="button"
          className="product-price-inquiry__back"
          onClick={() => router.back()}
        >
          <ChevronLeft aria-hidden size={18} />
          뒤로
        </button>

        <header className="product-price-inquiry__header">
          <h1 className="product-price-inquiry__title">상품 가격 문의</h1>
          <p className="product-price-inquiry__lead">선택하신 상품의 가격을 안내해 드립니다.</p>
        </header>

        {(productName || productCode) && (
          <section className="product-price-inquiry__product" aria-label="문의 상품">
            <p className="product-price-inquiry__product-label">문의 상품</p>
            <p className="product-price-inquiry__product-name">{productName || productCode}</p>
            <dl className="product-price-inquiry__product-meta">
              {brand ? (
                <>
                  <dt>브랜드</dt>
                  <dd>{brand}</dd>
                </>
              ) : null}
              {productCode ? (
                <>
                  <dt>규격</dt>
                  <dd>{productCode}</dd>
                </>
              ) : null}
            </dl>
          </section>
        )}

        {done ? (
          <div className="product-price-inquiry__done" role="status">
            <p className="font-bold text-emerald-800">문의가 접수되었습니다.</p>
            <p className="mt-1 text-sm text-slate-600">빠른 시일 내에 연락드리겠습니다.</p>
            <Link href="/" className="product-price-inquiry__home-link">
              홈으로
            </Link>
          </div>
        ) : (
          <>
            {error ? (
              <p className="product-price-inquiry__error" role="alert">
                {error}
              </p>
            ) : null}
            <SimpleInquiryForm
              optionalFields={["name"]}
              initialMessage={initialMessage}
              messageFirst
              submitLabel="문의 등록"
              submitting={submitting}
              onSubmit={handleSubmit}
            />
          </>
        )}
      </div>
    </div>
  );
}
