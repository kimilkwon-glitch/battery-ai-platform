"use client";

import Link from "next/link";
import { ContentCoverImage } from "@/components/content/ContentCoverImage";
import { HUB_PHOTO, HUB_SHOP_ANCHORS } from "@/lib/customer-hub-routes";
import { bm } from "@/lib/design-tokens";
import { preOrderChecklist } from "@/lib/shop-hub-data";

type Props = {
  /** 상품 영역 아래에 붙일 때 큰 히어로 생략 */
  afterProducts?: boolean;
};

export function ShopDeliveryHub({ afterProducts = false }: Props) {
  return (
    <div className="space-y-4">
      {!afterProducts ? (
        <section className={bm.heroPanel} id="hub-overview">
          <div className="p-5 sm:p-6">
            <p className="text-[11px] font-black text-blue-600">택배·쇼핑</p>
            <h2 className="mt-1 text-lg font-black text-slate-900 sm:text-xl">
              온라인 주문 · 배터리 상품 · 택배 전 확인
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-slate-600">
              주문 전 규격·단자·반납 조건은 상품 선택 후 아래 안내에서 확인하세요.
            </p>
            <nav className="mt-4 flex flex-wrap gap-1.5" aria-label="택배·쇼핑 섹션">
              {(
                [
                  ["order-check", "주문 전"],
                  ["shop-products", "상품"],
                  ["delivery-notes", "택배"],
                  ["terminal-lr", "단자"],
                  ["return-policy", "반납"],
                ] as const
              ).map(([id, label]) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="rounded-full bg-white px-3 py-1.5 text-[10px] font-black text-slate-700 ring-1 ring-slate-200 hover:bg-blue-50 hover:text-blue-700"
                >
                  {label}
                </a>
              ))}
            </nav>
          </div>
        </section>
      ) : null}

      <section
        className="overflow-hidden rounded-2xl border border-amber-100 bg-[#fdfbf7] shadow-sm"
        id="order-check"
      >
        <div className="border-b border-amber-100/80 bg-amber-50/50 px-4 py-2">
          <h3 className="text-base font-black text-slate-900">
            {afterProducts ? "3. 온라인 주문 전 규격 확인" : "1. 온라인 주문 전 규격 확인"}
          </h3>
        </div>
        <div className="p-4 sm:p-5">
          <ul className="space-y-2">
            {preOrderChecklist.map((item) => (
              <li key={item} className="flex items-start gap-2 text-xs font-semibold text-slate-700">
                <span className="mt-0.5 text-amber-500">✓</span>
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={HUB_PHOTO} className={`${bm.btnSecondary} text-xs`}>
              사진으로 최종 확인
            </Link>
            <Link href="/vehicles" className={`${bm.btnTertiary} text-xs`}>
              차량 검색
            </Link>
          </div>
        </div>
      </section>

      <section className={`${bm.card} ${bm.cardPad}`} id="delivery-notes">
        <h3 className="text-base font-black text-slate-950">
          {afterProducts ? "4. 택배 주문 전 주의사항" : "2. 택배 주문 전 주의사항"}
        </h3>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm font-medium text-slate-700">
          <li>배송 전 차량·규격·단자 방향 최종 확인</li>
          <li>상품명·용량·L/R 표기와 실제 장착 규격 일치 여부</li>
          <li>ISG·하이브리드 차량은 용량 다운그레이드 주의</li>
        </ul>
      </section>

      <section className={`${bm.card} ${bm.cardPad}`} id="photo-send">
        <h3 className="text-base font-black text-slate-950">
          {afterProducts ? "5. 사진 보내는 방법" : "3. 사진 보내는 방법"}
        </h3>
        <p className="mt-2 text-sm font-semibold text-slate-600">
          배터리 라벨, 단자 방향, 장착 위치가 보이는 사진을 함께 보내 주세요.
        </p>
        <Link className={`${bm.btnTertiary} mt-3 inline-flex text-xs`} href={HUB_PHOTO}>
          사진으로 최종 확인
        </Link>
      </section>

      <section className={`${bm.card} ${bm.cardPad}`} id="terminal-lr">
        <h3 className="text-base font-black text-slate-950">
          {afterProducts ? "6. L/R 단자 방향 확인" : "4. L/R 단자 방향 확인"}
        </h3>
        <p className="mt-2 text-sm font-semibold text-slate-600">
          규격 끝자리 L/R과 실제 단자 위치를 교체 전에 확인하세요.
        </p>
        <Link className={`${bm.btnTertiary} mt-3 inline-flex text-xs`} href="/guides">
          규격 가이드 보기
        </Link>
      </section>

      <section
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        id="return-policy"
      >
        <ContentCoverImage
          contentId="admin-shopping-001"
          objectFit="contain"
          roundedClass="rounded-none rounded-t-2xl"
          title="반납·미반납 안내"
          variant="card"
        />
        <div className="p-4 sm:p-5">
          <h3 className="text-base font-black text-slate-950">
            {afterProducts ? "7. 반납/회수 안내" : "5. 반납/회수 안내"}
          </h3>
          <p className="mt-2 text-sm font-semibold text-slate-600">
            택배 교체 시 구배터리 반납 조건·미반납 시 추가 비용을 주문 전 확인하세요.
          </p>
        </div>
      </section>

      <section className={`${bm.card} ${bm.cardPad}`} id="shop-contact">
        <h3 className="text-base font-black text-slate-950">문의하기</h3>
        <p className="mt-2 text-sm font-semibold text-slate-600">
          상품 선택이 어려우면 사진·차량 정보와 함께 문의해 주세요.
        </p>
        <Link className={`${bm.btnSecondary} mt-3 inline-flex text-xs`} href="/ai">
          문의하기
        </Link>
      </section>
    </div>
  );
}
