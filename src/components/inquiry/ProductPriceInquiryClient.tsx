"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { inquiryTitleFromMessage } from "@/lib/inquiry/inquiry-form-shared";
import { buildProductQnaDetailUrl } from "@/lib/inquiry/product-qna-url";
import { submitProductQna } from "@/lib/inquiry-storage";
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

  const [message, setMessage] = useState(initialMessage);
  const [isSecret, setIsSecret] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMessage(initialMessage);
  }, [initialMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productCode) {
      setError("상품 정보가 올바르지 않습니다.");
      return;
    }
    const trimmed = message.trim();
    if (!trimmed) {
      setError("문의 내용을 입력해 주세요.");
      return;
    }

    setError(null);
    setSubmitting(true);
    const title = inquiryTitleFromMessage(trimmed);
    const result = await submitProductQna({
      message: trimmed,
      title,
      batteryCode: productCode,
      productCode,
      productName: productName || productCode,
      pageUrl: sourceUrl || undefined,
      source: "product_qna",
      inquiryType: "가격문의",
      category: "battery",
      isSecret,
    });
    setSubmitting(false);

    if (!result.ok || !result.id) {
      setError("문의 접수에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }

    router.push(buildProductQnaDetailUrl(productCode, result.id));
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

        <form className="product-price-inquiry__form" onSubmit={(e) => void handleSubmit(e)}>
          {error ? (
            <p className="product-price-inquiry__error" role="alert">
              {error}
            </p>
          ) : null}

          <label className="product-price-inquiry__field">
            <span className="product-price-inquiry__field-label">문의 내용</span>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="product-price-inquiry__textarea"
            />
          </label>

          <label className="product-price-inquiry__secret">
            <input
              type="checkbox"
              checked={isSecret}
              onChange={(e) => setIsSecret(e.target.checked)}
            />
            <span className="product-price-inquiry__secret-label">비밀글로 등록</span>
          </label>
          <p className="product-price-inquiry__secret-hint">
            비밀글은 작성자와 관리자만 내용을 확인할 수 있습니다.
          </p>

          <button
            type="submit"
            className="product-price-inquiry__submit"
            disabled={submitting}
          >
            {submitting ? "등록 중…" : "문의 등록"}
          </button>
        </form>
      </div>
    </div>
  );
}
