import { BUSINESS_INFO, CUSTOMER_CENTER } from "@/lib/business-config";
import { COMMERCE_PRICING_POLICY } from "@/data/commerce-pricing-policy";
import { BATTERY_NO_RETURN_FEE, DELIVERY_FEE } from "@/lib/pricing/order-price";
import { CUSTOMER_PRICE_LABELS } from "@/lib/pricing/customer-price-labels";
import { HUB_STORE_DETAIL } from "@/lib/customer-hub-routes";

export type LegalSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type LegalPageData = {
  slug: string;
  title: string;
  description: string;
  updatedAt: string;
  sections: LegalSection[];
};

const BIZ = BUSINESS_INFO;
const CC = CUSTOMER_CENTER;

export const TERMS_PAGE: LegalPageData = {
  slug: "terms",
  title: "이용약관",
  description: "배터리매니저 자사몰 이용에 관한 기본 조건을 안내합니다.",
  updatedAt: "2026-06-06",
  sections: [
    {
      heading: "제1조 (목적)",
      paragraphs: [
        `본 약관은 ${BIZ.tradeName}(이하 "몰")이 운영하는 배터리매니저 온라인 쇼핑몰에서 제공하는 상품 주문·결제·배송·장착 관련 서비스 이용과 관련하여 몰과 이용자 간 권리·의무를 정합니다.`,
      ],
    },
    {
      heading: "제2조 (용어 정의)",
      bullets: [
        `"회원"이란 몰에 가입하여 아이디로 서비스를 이용하는 고객을 말합니다.`,
        `"주문"이란 회원이 상품 구매 의사를 표시하고 결제를 진행하는 행위를 말합니다.`,
        `"제품 구매가"란 배터리 상품 자체의 판매 가격을 말합니다.`,
        `"수령/장착 방식"이란 택배 주문, 출장 교체, 매장 교체, 매장 수령 중 선택한 방법을 말합니다.`,
        `"폐배터리 반납"이란 기존 배터리를 회수·반납하는 조건 여부를 말합니다.`,
      ],
    },
    {
      heading: "제3조 (회원가입 및 계정)",
      bullets: [
        "배터리 상품 주문·결제는 회원 로그인 후 진행합니다.",
        "회원은 정확한 이름, 연락처, 배송지·차량 정보를 제공해야 합니다.",
        "회원은 계정 정보를 타인에게 양도·대여할 수 없습니다.",
        "회원 탈퇴 시 주문 내역·혜택은 관련 법령 및 내부 정책에 따라 처리됩니다.",
      ],
    },
    {
      heading: "제4조 (서비스 이용)",
      bullets: [
        "몰은 차량별 배터리 규격 검색, 상품 안내, 주문·결제, 배송·장착 안내 서비스를 제공합니다.",
        "서비스 내용은 운영상 필요에 따라 변경될 수 있으며, 중요한 변경은 사전에 안내합니다.",
        "이용자는 관련 법령과 본 약관을 준수해야 합니다.",
      ],
    },
    {
      heading: "제5조 (상품 주문 및 결제)",
      bullets: [
        "상품 상세, 장바구니, 주문서에 표시된 규격·가격·수령/장착 방식이 최종 주문 기준입니다.",
        "배터리는 차량 규격, 단자 방향, 연식·연료에 따라 호환 여부가 달라질 수 있습니다.",
        "결제는 토스페이먼츠(PG)를 통해 처리되며, 카드·계좌 등 결제수단 입력은 결제사 화면에서만 진행됩니다.",
        "결제 완료는 서버 승인 확인 후 확정됩니다.",
        "폐배터리 반납/미반납 선택에 따라 최종 결제금액이 달라질 수 있습니다.",
      ],
    },
    {
      heading: "제6조 (배송 및 장착)",
      bullets: [
        `택배 주문: ${CUSTOMER_PRICE_LABELS.productPurchase} + 택배비 ${DELIVERY_FEE.toLocaleString("ko-KR")}원`,
        "매장 수령: 제품 구매가 기준이며 택배비 없음",
        "출장·매장 교체: 출장 교체가 기준으로 계산되며, 일정은 지역·재고·작업 가능 시간에 따라 조율됩니다.",
        "배송 준비가 시작된 이후에는 주문 변경·취소가 제한될 수 있습니다.",
      ],
    },
    {
      heading: "제7조 (폐배터리 반납/미반납)",
      bullets: [
        "주문 시 폐배터리 반납 여부를 선택해야 합니다.",
        `미반납 선택 시 추가금 ${BATTERY_NO_RETURN_FEE.toLocaleString("ko-KR")}원이 적용될 수 있습니다.`,
        "반납 조건 주문의 경우 회수 절차를 안내드립니다.",
      ],
    },
    {
      heading: "제8조 (교환·반품·환불)",
      paragraphs: [
        "교환·반품·환불 기준은 교환/환불 안내 페이지를 따릅니다.",
        "배터리는 장착·사용 여부에 따라 단순 변심 반품이 제한될 수 있습니다.",
      ],
    },
    {
      heading: "제9조 (서비스 제한)",
      bullets: [
        "허위 주문, 부정 결제, 타인 정보 도용 등이 확인되면 주문·이용이 제한될 수 있습니다.",
        "시스템 점검·천재지변·PG·택배사 장애 등으로 서비스가 일시 중단될 수 있습니다.",
      ],
    },
    {
      heading: "제10조 (책임 제한)",
      bullets: [
        "이용자가 잘못된 차량·규격 정보를 입력하여 발생한 비용은 이용자 책임일 수 있습니다.",
        "불가항력으로 인한 배송·장착 지연에 대해 합리적 범위 내에서 책임이 제한될 수 있습니다.",
      ],
    },
    {
      heading: "제11조 (분쟁 처리)",
      bullets: [
        "분쟁 발생 시 고객센터로 먼저 문의해 주시면 확인 후 안내드립니다.",
        "전자상거래 분쟁조정위원회 등 관련 기관의 조정을 따를 수 있습니다.",
      ],
    },
    {
      heading: "제12조 (고객센터)",
      bullets: [
        `상호: ${BIZ.tradeName}`,
        `대표: ${BIZ.representative}`,
        `고객센터: ${CC.phone}`,
        `이메일: ${BIZ.email}`,
      ],
    },
  ],
};

export const PRIVACY_PAGE: LegalPageData = {
  slug: "privacy",
  title: "개인정보처리방침",
  description: "배터리매니저가 수집·이용하는 개인정보 항목과 보관 기준을 안내합니다.",
  updatedAt: "2026-06-06",
  sections: [
    {
      heading: "개인정보처리자",
      bullets: [
        `개인정보처리자: ${BIZ.tradeName}`,
        `대표자: ${BIZ.representative}`,
        `개인정보보호책임자: ${BIZ.privacyOfficer}`,
        `연락처: ${CC.phone}`,
        `이메일: ${BIZ.email}`,
      ],
    },
    {
      heading: "수집하는 개인정보 항목",
      bullets: [
        "회원가입/로그인: 이름, 휴대전화번호, 이메일, 비밀번호(일반 회원가입 시), 소셜 로그인 식별값(네이버·카카오·구글 로그인 사용 시)",
        "주문/배송/장착: 주문자 이름, 연락처, 배송지 주소, 주문 상품 정보, 결제 정보, 배송·장착 요청사항, 폐배터리 반납 여부",
        "차량정보(사용자 입력 시): 차량명, 연식, 연료 타입, 차량번호 뒷자리, 현재 장착 배터리 규격",
        "문의 접수: 이름, 연락처, 문의 내용, 선택 입력한 차량정보",
      ],
    },
    {
      heading: "개인정보 이용 목적",
      bullets: [
        "회원가입 및 로그인",
        "주문 접수 및 결제 처리",
        "상품 배송",
        "매장 수령 및 출장·내방 장착 안내",
        "배터리 규격 확인",
        "고객 문의 응대",
        "주문내역 관리",
        "교환·반품·환불 처리",
        "서비스 개선 및 부정 이용 방지",
      ],
    },
    {
      heading: "보유 및 이용 기간",
      bullets: [
        "회원 정보: 회원 탈퇴 시까지",
        "주문·결제·배송 관련 정보: 관계 법령에 따른 보관 기간까지",
        "문의 정보: 상담 완료 후 필요한 기간까지 보관 후 파기",
        "법령에 따라 보존이 필요한 경우 해당 기간 동안 보관",
      ],
    },
    {
      heading: "제3자 제공",
      paragraphs: [
        "원칙적으로 고객 동의 없이 제3자에게 개인정보를 제공하지 않습니다.",
        "다만 법령에 따라 수사기관 등의 요청이 있는 경우 예외적으로 제공될 수 있습니다.",
      ],
    },
    {
      heading: "처리위탁",
      bullets: [
        "결제 처리: 토스페이먼츠(주) — 결제 승인·취소·환불 처리",
        "배송 처리: 택배사(주문 시 선택·운영 정책에 따름) — 상품 배송",
        "기타 위탁 업체가 추가되는 경우 본 방침을 통해 안내합니다.",
      ],
    },
    {
      heading: "네이버 로그인 안내",
      bullets: [
        "네이버 로그인 사용 시 네이버 계정 식별값, 이름, 이메일 등 동의한 정보가 회원가입 및 로그인 목적으로 활용됩니다.",
        "휴대전화번호는 네이버에서 제공되거나, 사용자가 직접 입력한 경우에만 저장됩니다.",
        "주소와 차량정보는 네이버에서 자동으로 제공받는 정보가 아니며, 사용자가 직접 입력한 경우에만 저장됩니다.",
      ],
    },
    {
      heading: "카카오·구글 로그인 안내",
      bullets: [
        "카카오·구글 로그인 사용 시 각 서비스에서 동의한 식별값, 이름, 이메일 등이 회원가입 및 로그인 목적으로 활용됩니다.",
        "휴대전화번호·주소·차량정보는 각 서비스에서 자동 제공되지 않으며, 사용자가 직접 입력한 경우에만 저장됩니다.",
      ],
    },
    {
      heading: "결제 정보 안내",
      paragraphs: [
        "카드번호, 유효기간, CVC 등 결제수단 정보는 당사 사이트가 아닌 결제사(PG) 화면에서만 입력됩니다.",
        "당사는 카드번호 등 민감 결제정보를 직접 저장하지 않습니다.",
      ],
    },
    {
      heading: "문의",
      paragraphs: [
        `개인정보 관련 문의는 고객센터 ${CC.phone} 또는 ${BIZ.email}로 연락해 주세요.`,
      ],
    },
  ],
};

export const SHIPPING_PAGE: LegalPageData = {
  slug: "shipping",
  title: "배송 안내",
  description: "택배·매장 수령·출장·매장 교체 방식별 배송·장착 안내입니다.",
  updatedAt: "2026-06-06",
  sections: [
    {
      heading: "수령/장착 방식별 가격",
      bullets: [
        `${COMMERCE_PRICING_POLICY.delivery.label}: ${COMMERCE_PRICING_POLICY.delivery.formula}`,
        `${COMMERCE_PRICING_POLICY.visitInstall.label}: ${COMMERCE_PRICING_POLICY.visitInstall.formula}`,
        `${COMMERCE_PRICING_POLICY.storeInstall.label}: ${COMMERCE_PRICING_POLICY.storeInstall.formula}`,
        `${COMMERCE_PRICING_POLICY.storePickupSelf.label}: ${COMMERCE_PRICING_POLICY.storePickupSelf.formula}`,
      ],
    },
    {
      heading: "택배 주문",
      bullets: [
        "전국 택배 발송이 가능합니다.",
        `택배비 ${DELIVERY_FEE.toLocaleString("ko-KR")}원이 ${CUSTOMER_PRICE_LABELS.productPurchase}에 추가됩니다.`,
        "결제 확인 후 순차 발송됩니다.",
        "배송지는 주소검색을 통해 입력합니다.",
        "운송장 등록 후 택배사 스캔 반영까지 시간이 걸릴 수 있습니다.",
        "도서산간·특수지역 추가비가 발생하는 경우 별도 안내드립니다.",
      ],
    },
    {
      heading: "매장 수령",
      bullets: [
        `${CUSTOMER_PRICE_LABELS.productPurchase} 기준이며 택배비가 없습니다.`,
        "매장에서 제품만 수령해 직접 교체하는 방식입니다.",
        `매장 위치·연락처는 ${HUB_STORE_DETAIL}에서 확인할 수 있습니다.`,
      ],
    },
    {
      heading: "출장 교체",
      bullets: [
        "고객이 입력한 출장 지역·주소를 기준으로 일정을 조율합니다.",
        "출장 교체가 기준으로 결제금액이 계산됩니다.",
        "지역·일정·차량 상태에 따라 방문 일정이 조정될 수 있습니다.",
      ],
    },
    {
      heading: "매장 교체",
      bullets: [
        "매장 방문 후 교체하는 방식입니다.",
        "출장 교체가에서 매장 방문 할인이 적용됩니다.",
      ],
    },
    {
      heading: "주문 변경·취소",
      bullets: [
        "배송 준비가 시작된 이후에는 변경·취소가 제한될 수 있습니다.",
        "변경이 필요하면 고객센터로 빠르게 연락해 주세요.",
      ],
    },
    {
      heading: "폐배터리 반납",
      paragraphs: [
        "폐배터리 반납/미반납 선택에 따라 최종 결제금액과 회수 절차가 달라질 수 있습니다.",
        "자세한 내용은 폐전지 반납 안내 및 교환/환불 안내를 참고해 주세요.",
      ],
    },
    {
      heading: "문의",
      bullets: [`고객센터: ${CC.phone}`, `이메일: ${BIZ.email}`],
    },
  ],
};

export const SHIPPING_RETURNS_PAGE: LegalPageData = {
  slug: "shipping-returns",
  title: "배송·교환·반품·환불 안내",
  description:
    "자동차 배터리 판매 특성을 반영한 배송·장착·교환·반품·환불 기준을 안내합니다.",
  updatedAt: "2026-06-09",
  sections: [
    {
      heading: "수령/장착 방식별 가격 기준",
      bullets: [
        `${COMMERCE_PRICING_POLICY.delivery.label}: ${COMMERCE_PRICING_POLICY.delivery.formula} — ${COMMERCE_PRICING_POLICY.delivery.note}`,
        `${COMMERCE_PRICING_POLICY.visitInstall.label}: ${COMMERCE_PRICING_POLICY.visitInstall.formula} — 내방(출장) 교체 시 출장가 기준이며, 매장 내방교체는 출장가에서 5,000원 할인이 적용됩니다.`,
        `${COMMERCE_PRICING_POLICY.storeInstall.label}: ${COMMERCE_PRICING_POLICY.storeInstall.formula}`,
        `${COMMERCE_PRICING_POLICY.storePickupSelf.label}: ${COMMERCE_PRICING_POLICY.storePickupSelf.formula} — 택배비 15,000원은 부과되지 않습니다.`,
      ],
    },
    {
      heading: "택배 배송",
      bullets: [
        "전국 택배 발송이 가능합니다.",
        `택배 주문은 ${CUSTOMER_PRICE_LABELS.productPurchase} + 택배비 ${DELIVERY_FEE.toLocaleString("ko-KR")}원 기준입니다.`,
        "결제 확인 후 순차 발송됩니다.",
        "배송지는 주소검색을 통해 입력합니다.",
        "운송장 등록 후 택배사 스캔 반영까지 시간이 걸릴 수 있습니다.",
        "도서산간·특수지역 추가비가 발생하는 경우 별도 안내드립니다.",
      ],
    },
    {
      heading: "매장 수령·셀프 교체",
      bullets: [
        `${CUSTOMER_PRICE_LABELS.productPurchase} 기준이며 택배비는 부과되지 않습니다.`,
        "매장에서 제품만 수령해 직접 교체하는 방식입니다.",
        `매장 위치·연락처는 매장 안내 페이지(${HUB_STORE_DETAIL})에서 확인할 수 있습니다.`,
      ],
    },
    {
      heading: "출장·매장 교체",
      bullets: [
        "출장 교체는 고객 위치 기준 출장 교체가로 계산됩니다.",
        "매장 방문 교체는 출장 교체가에서 5,000원 할인이 적용됩니다.",
        "지역·일정·차량 상태에 따라 방문 일정이 조정될 수 있습니다.",
      ],
    },
    {
      heading: "주문 전 확인 (오주문 방지)",
      bullets: [
        "차량 연식, 연료, 배터리 규격, 단자 방향을 반드시 확인해 주세요.",
        "차량정보·배터리 규격이 맞지 않으면 교환·환불이 어려울 수 있습니다.",
        "확인이 어려우시면 주문 전 고객센터로 상담해 주세요.",
        `고객센터: ${CC.phone}`,
      ],
    },
    {
      heading: "폐전지 반납 조건",
      bullets: [
        "주문 시 폐전지 반납/미반납을 선택해야 합니다.",
        `미반납 선택 시 추가금 ${BATTERY_NO_RETURN_FEE.toLocaleString("ko-KR")}원이 적용될 수 있습니다.`,
        "반납 조건 상품의 경우 폐전지 미반납 시 추가 비용이 발생할 수 있습니다.",
        "반납 조건 주문의 경우 회수 절차를 안내드립니다.",
      ],
    },
    {
      heading: "교환·반품·환불",
      bullets: [
        "제품 불량·오배송이 확인되면 교환·환불을 안내드립니다. 장착·사용 전 빠른 연락을 권장합니다.",
        "배터리는 전기·화학 제품 특성상 개봉·장착·사용 흔적이 있으면 단순 변심 반품이 제한될 수 있습니다.",
        "단순 변심 반품 시 반품 배송비 또는 왕복 배송비가 차감될 수 있습니다.",
        "설치·장착이 완료된 경우 상품 상태에 따라 교환·환불이 제한될 수 있습니다.",
        "결제 취소·환불은 결제수단 및 PG사(토스페이먼츠) 기준에 따라 처리됩니다.",
      ],
    },
    {
      heading: "주문 변경·취소",
      bullets: [
        "배송 준비가 시작된 이후에는 변경·취소가 제한될 수 있습니다.",
        "변경이 필요하면 고객센터로 빠르게 연락해 주세요.",
      ],
    },
    {
      heading: "문의",
      bullets: [`고객센터: ${CC.phone}`, `이메일: ${BIZ.email}`],
    },
  ],
};

export const REFUND_PAGE: LegalPageData = {
  slug: "refund",
  title: "교환/환불 안내",
  description: "배터리 상품 특성에 따른 교환·환불·결제 취소 기준을 안내합니다.",
  updatedAt: "2026-06-06",
  sections: [
    {
      heading: "기본 안내",
      paragraphs: [
        "배터리는 장착 여부와 제품 상태에 따라 교환·환불 가능 여부가 달라질 수 있습니다.",
        "수령 후 문제가 있다면 고객센터로 먼저 문의해 주세요.",
        `고객센터: ${CC.phone}`,
      ],
    },
    {
      heading: "주문 전 확인",
      bullets: [
        "차량 연식, 연료, 배터리 규격, 단자 방향을 확인해 주세요.",
        "폐배터리 반납/미반납 조건에 따라 금액과 회수 절차가 달라집니다.",
        `미반납 선택 시 추가금 ${BATTERY_NO_RETURN_FEE.toLocaleString("ko-KR")}원이 적용될 수 있습니다.`,
        "수령/장착 방식에 따라 결제금액이 달라집니다.",
      ],
    },
    {
      heading: "제품 불량·오배송",
      bullets: [
        "상품 수령 후 제품 불량 또는 오배송이 확인되면 교환·환불을 안내드립니다.",
        "장착·사용 전 가능한 한 빠르게 고객센터로 연락해 주세요.",
        "사진과 주문번호를 함께 알려 주시면 확인이 빠릅니다.",
      ],
    },
    {
      heading: "단순 변심",
      bullets: [
        "고객 단순 변심의 경우 왕복 배송비 또는 회수 비용이 발생할 수 있습니다.",
        "배터리는 전기·화학 제품 특성상 개봉·장착·사용 후 단순 변심 반품이 제한될 수 있습니다.",
      ],
    },
    {
      heading: "장착 완료 후",
      bullets: [
        "설치·장착이 완료된 경우 상품 상태에 따라 교환·환불이 제한될 수 있습니다.",
        "사용 흔적, 단자 체결 흔적, 임의 충전·방전, 외부 충격이 확인되면 교환·환불이 제한될 수 있습니다.",
      ],
    },
    {
      heading: "폐배터리 반납",
      bullets: [
        "반납/미반납 선택에 따라 회수·비용 안내가 달라집니다.",
        "반납 조건 주문의 경우 폐배터리 회수 절차를 안내드립니다.",
      ],
    },
    {
      heading: "반품·환불 비용",
      bullets: [
        "반품·환불 시 기존 배송비와 회수비 처리 기준은 상품 상태·사유에 따라 안내드립니다.",
        "결제 취소·환불은 결제수단 및 PG사(토스페이먼츠) 기준에 따라 처리됩니다.",
        "환불 소요 기간은 카드사·결제수단 정책에 따릅니다.",
      ],
    },
    {
      heading: "문의",
      bullets: [`고객센터: ${CC.phone}`, `이메일: ${BIZ.email}`],
    },
  ],
};

export const COMPANY_PAGE: LegalPageData = {
  slug: "company",
  title: "회사/사업자 정보",
  description: "배터리매니저의 사업자 정보와 매장 운영 정보를 확인하실 수 있습니다.",
  updatedAt: "2026-06-06",
  sections: [
    {
      heading: "사업자 정보",
      bullets: [
        `상호명: ${BIZ.tradeName}`,
        `대표자: ${BIZ.representative}`,
        `사업자등록번호: ${BIZ.businessRegistrationNumber}`,
        `통신판매업 신고번호: ${BIZ.mailOrderReportNumber}`,
        `사업장 주소: ${BIZ.address}`,
        `고객센터: ${CC.phone}`,
        `이메일: ${BIZ.email}`,
        `개인정보보호책임자: ${BIZ.privacyOfficer}`,
      ],
    },
    {
      heading: "운영시간",
      bullets: [
        BIZ.hours.weekday,
        BIZ.hours.saturday,
        BIZ.hours.sunday,
      ],
    },
    {
      heading: "서비스 소개",
      paragraphs: [
        "배터리매니저는 차량별 배터리 규격 검색, 상품 주문, 택배·출장·내방 교체 안내를 제공하는 자동차 배터리 전문 쇼핑몰입니다.",
        "부산 지역 덕천점·학장점을 중심으로 출장·내방 서비스를 운영합니다.",
      ],
    },
    {
      heading: "매장 안내",
      bullets: [
        `${BIZ.branches.deokcheon.name}: ${BIZ.branches.deokcheon.phone}`,
        `${BIZ.branches.hakjang.name}: ${BIZ.branches.hakjang.phone}`,
        `매장 위치·영업 정보는 매장 안내 페이지(${HUB_STORE_DETAIL})에서 확인할 수 있습니다.`,
      ],
    },
    {
      heading: "고객 문의",
      paragraphs: [
        `일반 상담·주문 문의는 고객센터 ${CC.phone}로 연락해 주세요.`,
        "지점별 직통 번호는 매장 안내에서 확인하실 수 있습니다.",
      ],
    },
  ],
};
