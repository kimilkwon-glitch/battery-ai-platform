import { COMMERCE_PRICING_EXAMPLES, COMMERCE_PRICING_POLICY } from "@/data/commerce-pricing-policy";
import { BUSAN_STORES } from "@/lib/busan-service-hub-data";

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

export const TERMS_PAGE: LegalPageData = {
  slug: "terms",
  title: "이용약관",
  description: "배터리매니저 자사몰 이용에 관한 기본 조건을 안내합니다.",
  updatedAt: "2026-05-30",
  sections: [
    {
      heading: "제1조 (목적)",
      paragraphs: [
        "본 약관은 배터리매니저(이하 \"몰\")가 제공하는 배터리 상품 주문·상담·결제 관련 서비스 이용과 관련하여 몰과 이용자 간 권리·의무를 정합니다.",
      ],
    },
    {
      heading: "제2조 (회원 및 비회원)",
      bullets: [
        "회원은 계정 정보를 통해 주문 내역을 관리할 수 있습니다.",
        "비회원도 주문서 작성 및 결제가 가능하며, 주문 조회는 접수 시 안내된 정보로 확인합니다.",
        "이용자는 주문 시 정확한 연락처·차량 정보·수령/장착 방식을 제공해야 합니다.",
      ],
    },
    {
      heading: "제3조 (상품 정보 및 주문)",
      bullets: [
        "배터리 규격·단자 방향·차량 연식·연료는 주문 전 반드시 확인해야 합니다.",
        "상품 상세, 장바구니, 주문서에 표시된 가격과 수령/장착 방식이 최종 결제 기준입니다.",
        "주문 접수 후 차량·규격·수령 방식 변경이 필요한 경우 고객센터로 연락해 주세요.",
      ],
    },
    {
      heading: "제4조 (결제)",
      bullets: [
        "결제는 토스페이먼츠를 통해 처리되며, 카드·계좌 등 결제수단 입력은 결제사 화면에서만 진행됩니다.",
        "결제 완료는 서버 승인 확인 후 확정되며, 결제 예정금액과 실제 승인 금액이 일치해야 합니다.",
        "결제 실패·취소 시 주문은 결제 완료 상태로 처리되지 않습니다.",
      ],
    },
    {
      heading: "제5조 (취소·환불)",
      paragraphs: [
        "주문 취소·환불·교환은 교환/환불 안내 및 상품 특성에 따른 기준을 따릅니다.",
        "배터리 상품은 장착·사용 여부에 따라 단순 변심 반품이 제한될 수 있습니다.",
      ],
    },
    {
      heading: "제6조 (면책)",
      paragraphs: [
        "천재지변, 택배사·PG사 장애 등 불가항력으로 인한 지연에 대해 합리적 범위 내에서 책임이 제한될 수 있습니다.",
        "이용자가 잘못된 차량·규격 정보를 입력하여 발생한 교환·추가 비용은 이용자 책임일 수 있습니다.",
      ],
    },
  ],
};

export const PRIVACY_PAGE: LegalPageData = {
  slug: "privacy",
  title: "개인정보처리방침",
  description: "배터리매니저가 수집·이용하는 개인정보 항목과 보관 기준을 안내합니다.",
  updatedAt: "2026-05-30",
  sections: [
    {
      heading: "수집 항목",
      bullets: [
        "필수: 이름, 연락처(휴대전화)",
        "선택: 이메일",
        "주문 관련: 배송지, 출장지, 방문 지점, 차량명·연식·연료, 배터리 규격, 요청사항",
        "결제 관련: 주문번호, 결제금액, 결제상태 (카드번호·CVC 등 민감 결제정보는 수집하지 않음)",
      ],
    },
    {
      heading: "이용 목적",
      bullets: [
        "주문 접수 및 결제 확인",
        "택배 발송, 출장·내방 일정 안내",
        "고객 상담 및 A/S 안내",
        "주문·결제 분쟁 처리 및 법령상 의무 이행",
      ],
    },
    {
      heading: "보관 기간",
      bullets: [
        "주문·결제 관련 정보: 관련 법령 및 내부 정책에 따른 기간 보관 후 파기",
        "상담 문의: 처리 완료 후 합리적 기간 보관",
      ],
    },
    {
      heading: "제3자 제공",
      paragraphs: [
        "원칙적으로 이용자 개인정보를 외부에 제공하지 않습니다.",
        "다만 결제 처리를 위해 토스페이먼츠에 결제에 필요한 최소 정보가 전달될 수 있습니다.",
        "법령에 따른 요청이 있는 경우 예외적으로 제공될 수 있습니다.",
      ],
    },
    {
      heading: "결제 처리 안내",
      paragraphs: [
        "온라인 결제는 토스페이먼츠(PG)를 통해 안전하게 처리됩니다.",
        "카드번호, 유효기간, CVC 등 결제수단 정보는 당사 사이트가 아닌 결제사 화면에서만 입력됩니다.",
      ],
    },
    {
      heading: "문의",
      paragraphs: [
        "개인정보 관련 문의는 고객센터 또는 푸터에 안내된 연락처로 문의해 주세요.",
        "개인정보보호책임자 정보는 회사/매장 정보 페이지에서 확인할 수 있습니다.",
      ],
    },
  ],
};

export const SHIPPING_PAGE: LegalPageData = {
  slug: "shipping",
  title: "배송 안내",
  description: "수령/장착 방식별 배송·방문·출장 안내와 결제 예정금액 기준을 설명합니다.",
  updatedAt: "2026-05-30",
  sections: [
    {
      heading: "가격·배송 정책 (수령/장착 방식별)",
      bullets: [
        `${COMMERCE_PRICING_POLICY.delivery.label}: ${COMMERCE_PRICING_POLICY.delivery.formula}`,
        `${COMMERCE_PRICING_POLICY.visitInstall.label}: ${COMMERCE_PRICING_POLICY.visitInstall.formula}`,
        `${COMMERCE_PRICING_POLICY.storeInstall.label}: ${COMMERCE_PRICING_POLICY.storeInstall.formula}`,
        `${COMMERCE_PRICING_POLICY.storePickupSelf.label}: ${COMMERCE_PRICING_POLICY.storePickupSelf.formula}`,
      ],
    },
    {
      heading: "택배 발송",
      bullets: [
        "결제 확인 후 순차 발송됩니다.",
        "택배비 15,000원이 인터넷가에 추가됩니다.",
        "운송장 등록 후 택배사 스캔 반영까지 시간이 걸릴 수 있습니다.",
      ],
    },
    {
      heading: "출장교체",
      bullets: [
        "고객이 입력한 출장 지역·주소를 기준으로 일정을 조율합니다.",
        "출장가 기준으로 결제 예정금액이 계산됩니다.",
        "지역·일정·차량 상태에 따라 방문 일정이 조정될 수 있습니다.",
      ],
    },
    {
      heading: "내방교체 / 내방수령",
      bullets: [
        `내방교체: 출장가에서 ${COMMERCE_PRICING_POLICY.storeInstall.formula.split("−")[1]?.trim() ?? "5,000원"} 차감`,
        "내방수령/셀프교체: 인터넷가 기준, 택배비 없음",
        `방문 지점: ${BUSAN_STORES.map((s) => s.name).join(", ")}`,
      ],
    },
    {
      heading: "일정 안내",
      paragraphs: [
        "배송·출장·매장 방문 일정은 지역, 재고, 작업 가능 시간에 따라 조율될 수 있습니다.",
        "정확한 일정은 주문 접수 후 담당자가 연락드립니다.",
      ],
    },
  ],
};

export const REFUND_PAGE: LegalPageData = {
  slug: "refund",
  title: "교환/환불 안내",
  description: "배터리 상품 특성에 따른 교환·환불·결제 취소 기준을 안내합니다.",
  updatedAt: "2026-05-30",
  sections: [
    {
      heading: "주문 전 확인",
      bullets: [
        "차량 연식, 연료, 배터리 규격, 단자 방향을 반드시 확인해 주세요.",
        "폐배터리 반납/미반납 조건에 따라 안내·비용이 달라질 수 있습니다.",
        "수령/장착 방식에 따라 결제 예정금액이 달라집니다.",
      ],
    },
    {
      heading: "단순 변심",
      bullets: [
        "배터리는 전기·화학 제품 특성상 개봉·장착·사용 후 단순 변심 반품이 제한될 수 있습니다.",
        "접수 전 고객센터에서 가능 여부를 확인해 주세요.",
      ],
    },
    {
      heading: "오배송·제품 불량",
      bullets: [
        "오배송·제품 불량이 확인되면 교환 또는 환불을 안내드립니다.",
        "장착·사용 전 가능한 한 빠르게 고객센터로 연락해 주세요.",
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
      heading: "결제 취소·환불",
      bullets: [
        "결제 취소·환불은 결제수단 및 PG사(토스페이먼츠) 기준에 따라 처리됩니다.",
        "승인 완료 전 취소와 승인 후 환불 절차가 다를 수 있습니다.",
        "환불 소요 기간은 카드사·결제수단 정책에 따릅니다.",
      ],
    },
  ],
};

export const COMPANY_PAGE: LegalPageData = {
  slug: "company",
  title: "회사/매장 정보",
  description: "배터리매니저 소개와 매장·고객센터 연락처를 안내합니다.",
  updatedAt: "2026-05-30",
  sections: [
    {
      heading: "서비스 소개",
      paragraphs: [
        "배터리매니저는 차량별 배터리 규격 검색, 상품 주문, 택배·출장·내방 교체 안내를 제공하는 자동차 배터리 전문 쇼핑몰입니다.",
        "부산 지역 덕천점·학장점을 중심으로 출장·내방 서비스를 운영합니다.",
      ],
    },
    {
      heading: "매장 안내",
      bullets: BUSAN_STORES.map(
        (s) => `${s.name} · ${s.tagline} · ${s.phone}`,
      ),
    },
    {
      heading: "고객센터",
      bullets: [
        "상담 문의, 주문 조회, FAQ는 고객센터(/support)에서 이용할 수 있습니다.",
        "전화 상담: 덕천점 010-8339-8316, 학장점 010-8896-8316",
      ],
    },
    {
      heading: "가격 정책 요약",
      bullets: COMMERCE_PRICING_EXAMPLES.map(
        (e) =>
          `${e.product} — 택배 ${e.delivery.toLocaleString("ko-KR")}원 / 출장 ${e.visit.toLocaleString("ko-KR")}원 / 내방교체 ${e.storeInstall.toLocaleString("ko-KR")}원`,
      ),
    },
  ],
};
