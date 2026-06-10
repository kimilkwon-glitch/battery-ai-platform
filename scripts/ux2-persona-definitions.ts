import type { FulfillmentMethod } from "../src/types/cart";
import type { OrderRequestUsedBatteryOption } from "../src/types/order-request";
import type {
  CommerceOrderLifecycleStatus,
  CommercePaymentStatus,
} from "../src/types/commerce-order";
import type { ClaimReasonCode, ClaimType } from "../src/types/commerce-claim";

export type Ux2AcquisitionChannel =
  | "네이버쇼핑광고"
  | "네이버일반검색"
  | "블로그사례글"
  | "당근소식"
  | "네이버플레이스"
  | "자사몰차종검색"
  | "자사몰규격검색"
  | "상품상세직접"
  | "배터리톡상담"
  | "고객센터문의";

export type Ux2CustomerArchetype =
  | "시동안걸림급함"
  | "차종세대헷갈림"
  | "규격명만앎"
  | "AGM구분모름"
  | "폐배터리반납모름"
  | "미반납고객"
  | "가격민감"
  | "출장비문의"
  | "택배직접교체"
  | "내방할인원함"
  | "사업자상용차"
  | "클레임가능성높음";

export type Ux2StoreChoice = "deokcheon" | "hakjang" | "undecided" | "delivery_only";

export type Ux2Feature = "order" | "battery_talk" | "inquiry" | "product_qna" | "claim";

export type Ux2Persona = {
  id: string;
  seq: number;
  name: string;
  scenarioSummary: string;
  acquisitionChannel: Ux2AcquisitionChannel;
  customerArchetype: Ux2CustomerArchetype;
  maker: string;
  vehicle: string;
  year: string;
  fuel: string;
  batteryCode: string;
  brandName: string;
  specConfidence: "confirmed" | "needs_verification";
  specNote?: string;
  searchQuery: string;
  fulfillment: FulfillmentMethod;
  store: Ux2StoreChoice;
  returnBattery: OrderRequestUsedBatteryOption;
  orderStatus: CommerceOrderLifecycleStatus;
  paymentStatus: CommercePaymentStatus;
  priorityToday: boolean;
  phoneCallbackNeeded: boolean;
  features: Ux2Feature[];
  batteryTalkMessage?: string;
  adminReply?: string;
  inquiryMessage?: string;
  inquiryCategory?: "order" | "spec" | "visit" | "return" | "other";
  productQnaMessage?: string;
  claimType?: ClaimType;
  claimReason?: ClaimReasonCode;
  claimMessage?: string;
};

const NAMES = [
  "김민준", "이서연", "박지훈", "최유나", "정도현", "한소희", "오준서", "윤하은", "장민재", "임수빈",
  "강태양", "조은비", "신우진", "홍예린", "문성호", "배다은", "류현우", "서지안", "권도윤", "남채원",
  "노승민", "도경수", "라미정", "마현석", "반지우", "백서준", "사공민", "아현우", "안서윤", "양준혁",
];

const CHANNELS: Ux2AcquisitionChannel[] = [
  "네이버쇼핑광고", "네이버쇼핑광고", "네이버쇼핑광고",
  "네이버일반검색", "네이버일반검색", "네이버일반검색",
  "블로그사례글", "블로그사례글", "블로그사례글",
  "당근소식", "당근소식",
  "네이버플레이스", "네이버플레이스",
  "자사몰차종검색", "자사몰차종검색", "자사몰차종검색", "자사몰차종검색",
  "자사몰규격검색", "자사몰규격검색", "자사몰규격검색", "자사몰규격검색",
  "상품상세직접", "상품상세직접", "상품상세직접",
  "배터리톡상담", "배터리톡상담", "배터리톡상담",
  "고객센터문의", "고객센터문의", "고객센터문의",
];

const ARCHETYPES: Ux2CustomerArchetype[] = [
  "시동안걸림급함", "차종세대헷갈림", "규격명만앎", "AGM구분모름", "폐배터리반납모름",
  "미반납고객", "가격민감", "출장비문의", "택배직접교체", "내방할인원함",
  "사업자상용차", "클레임가능성높음", "시동안걸림급함", "차종세대헷갈림", "규격명만앎",
  "AGM구분모름", "폐배터리반납모름", "미반납고객", "가격민감", "출장비문의",
  "택배직접교체", "내방할인원함", "사업자상용차", "클레임가능성높음", "시동안걸림급함",
  "차종세대헷갈림", "규격명만앎", "AGM구분모름", "폐배터리반납모름", "미반납고객",
];

const VEHICLES: Array<{
  maker: string;
  vehicle: string;
  year: string;
  fuel: string;
  batteryCode: string;
  brandName: string;
  searchQuery: string;
  specConfidence: "confirmed" | "needs_verification";
  specNote?: string;
}> = [
  { maker: "현대", vehicle: "그랜저 IG", year: "2018", fuel: "가솔린", batteryCode: "AGM80L", brandName: "로케트", searchQuery: "그랜저 IG", specConfidence: "confirmed" },
  { maker: "현대", vehicle: "쏘나타 DN8", year: "2020", fuel: "LPG", batteryCode: "AGM80L", brandName: "로케트", searchQuery: "쏘나타 DN8 LPG", specConfidence: "confirmed" },
  { maker: "현대", vehicle: "싼타페 DM", year: "2016", fuel: "디젤", batteryCode: "DIN74L", brandName: "쏠라이트", searchQuery: "싼타페 DM", specConfidence: "confirmed" },
  { maker: "현대", vehicle: "아반떼 CN7", year: "2021", fuel: "가솔린", batteryCode: "AGM60L", brandName: "로케트", searchQuery: "아반떼 CN7", specConfidence: "confirmed" },
  { maker: "현대", vehicle: "투싼 NX4", year: "2022", fuel: "가솔린", batteryCode: "AGM80L", brandName: "로케트", searchQuery: "투싼 NX4", specConfidence: "confirmed" },
  { maker: "현대", vehicle: "팰리세이드", year: "2020", fuel: "디젤", batteryCode: "AGM95L", brandName: "로케트", searchQuery: "팰리세이드", specConfidence: "confirmed" },
  { maker: "현대", vehicle: "스타리아", year: "2021", fuel: "디젤", batteryCode: "AGM95L", brandName: "쏠라이트", searchQuery: "스타리아", specConfidence: "needs_verification", specNote: "규격 확인 필요 시나리오(연료/옵션별 AGM 여부)" },
  { maker: "기아", vehicle: "K5 DL3", year: "2020", fuel: "가솔린", batteryCode: "AGM80L", brandName: "로케트", searchQuery: "K5 DL3", specConfidence: "confirmed" },
  { maker: "기아", vehicle: "K8", year: "2021", fuel: "하이브리드", batteryCode: "AGM80L", brandName: "쏠라이트", searchQuery: "K8", specConfidence: "confirmed" },
  { maker: "기아", vehicle: "쏘렌토 MQ4", year: "2021", fuel: "하이브리드", batteryCode: "AGM95L", brandName: "로케트", searchQuery: "쏘렌토 MQ4 하이브리드", specConfidence: "needs_verification", specNote: "규격 확인 필요 시나리오(MHEV/HEV 트림 확인)" },
  { maker: "기아", vehicle: "스포티지 NQ5", year: "2022", fuel: "디젤", batteryCode: "AGM80L", brandName: "쏠라이트", searchQuery: "스포티지 NQ5", specConfidence: "confirmed" },
  { maker: "기아", vehicle: "카니발 KA4", year: "2021", fuel: "디젤", batteryCode: "AGM95L", brandName: "로케트", searchQuery: "카니발 KA4", specConfidence: "confirmed" },
  { maker: "기아", vehicle: "모닝 어반", year: "2019", fuel: "가솔린", batteryCode: "AGM60L", brandName: "쏠라이트", searchQuery: "모닝", specConfidence: "confirmed" },
  { maker: "기아", vehicle: "레이", year: "2020", fuel: "가솔린", batteryCode: "AGM60L", brandName: "로케트", searchQuery: "레이", specConfidence: "confirmed" },
  { maker: "기아", vehicle: "봉고3", year: "2018", fuel: "디젤", batteryCode: "100R", brandName: "쏠라이트", searchQuery: "봉고3", specConfidence: "confirmed" },
  { maker: "제네시스", vehicle: "G80", year: "2019", fuel: "가솔린", batteryCode: "AGM95L", brandName: "로케트", searchQuery: "G80", specConfidence: "needs_verification", specNote: "규격 확인 필요 시나리오(AGM 적용 트림)" },
  { maker: "제네시스", vehicle: "GV70", year: "2021", fuel: "가솔린", batteryCode: "AGM80L", brandName: "쏠라이트", searchQuery: "GV70", specConfidence: "confirmed" },
  { maker: "제네시스", vehicle: "GV80", year: "2020", fuel: "가솔린", batteryCode: "AGM95L", brandName: "로케트", searchQuery: "GV80", specConfidence: "confirmed" },
  { maker: "제네시스", vehicle: "G90", year: "2018", fuel: "가솔린", batteryCode: "AGM95L", brandName: "쏠라이트", searchQuery: "G90 EQ900", specConfidence: "needs_verification", specNote: "규격 확인 필요 시나리오(G90/EQ900 세대)" },
  { maker: "쉐보레", vehicle: "스파크", year: "2016", fuel: "가솔린", batteryCode: "AGM60L", brandName: "로케트", searchQuery: "스파크", specConfidence: "confirmed" },
  { maker: "쉐보레", vehicle: "말리부", year: "2017", fuel: "가솔린", batteryCode: "AGM80L", brandName: "쏠라이트", searchQuery: "말리부", specConfidence: "confirmed" },
  { maker: "르노", vehicle: "QM6", year: "2017", fuel: "LPG", batteryCode: "CMF80L", brandName: "쏠라이트", searchQuery: "QM6 LPG", specConfidence: "confirmed" },
  { maker: "KGM", vehicle: "티볼리", year: "2019", fuel: "가솔린", batteryCode: "AGM70L", brandName: "쏠라이트", searchQuery: "티볼리", specConfidence: "confirmed" },
  { maker: "KGM", vehicle: "코란도C", year: "2018", fuel: "디젤", batteryCode: "DIN74L", brandName: "로케트", searchQuery: "코란도C", specConfidence: "confirmed" },
  { maker: "상용", vehicle: "포터2", year: "2017", fuel: "디젤", batteryCode: "100R", brandName: "로케트", searchQuery: "포터2", specConfidence: "confirmed" },
  { maker: "상용", vehicle: "마이티", year: "2016", fuel: "디젤", batteryCode: "100R", brandName: "쏠라이트", searchQuery: "마이티", specConfidence: "confirmed" },
  { maker: "현대", vehicle: "그랜저 HG", year: "2015", fuel: "LPG", batteryCode: "CMF80L", brandName: "쏠라이트", searchQuery: "그랜저 HG LPG", specConfidence: "confirmed" },
  { maker: "쉐보레", vehicle: "트랙스", year: "2018", fuel: "가솔린", batteryCode: "AGM70L", brandName: "로케트", searchQuery: "트랙스", specConfidence: "confirmed" },
  { maker: "르노", vehicle: "SM6", year: "2018", fuel: "가솔린", batteryCode: "AGM80L", brandName: "로케트", searchQuery: "SM6", specConfidence: "confirmed" },
  { maker: "KGM", vehicle: "렉스턴 스포츠", year: "2019", fuel: "디젤", batteryCode: "100R", brandName: "쏠라이트", searchQuery: "렉스턴 스포츠", specConfidence: "confirmed" },
];

const FULFILLMENTS: FulfillmentMethod[] = [
  "delivery", "delivery", "delivery", "delivery", "delivery", "delivery", "delivery", "delivery",
  "visit_install", "visit_install", "visit_install", "visit_install", "visit_install", "visit_install", "visit_install", "visit_install",
  "store_install", "store_install", "store_install", "store_install", "store_install", "store_install", "store_install",
  "store_pickup_self", "store_pickup_self", "store_pickup_self", "store_pickup_self", "store_pickup_self", "store_pickup_self", "store_pickup_self",
];

const STORES: Ux2StoreChoice[] = [
  "delivery_only", "delivery_only", "delivery_only", "delivery_only", "delivery_only", "delivery_only", "delivery_only", "delivery_only",
  "undecided", "undecided", "deokcheon", "deokcheon", "hakjang", "hakjang", "deokcheon", "hakjang",
  "deokcheon", "hakjang", "deokcheon", "hakjang", "undecided", "deokcheon", "hakjang",
  "deokcheon", "hakjang", "deokcheon", "hakjang", "undecided", "deokcheon", "hakjang",
];

const NO_RETURN_SEQS = new Set([6, 14, 18, 22, 26, 30]);

const ORDER_PLAN: Array<{ orderStatus: CommerceOrderLifecycleStatus; paymentStatus: CommercePaymentStatus }> = [
  { orderStatus: "payment_pending", paymentStatus: "not_started" },
  { orderStatus: "payment_completed", paymentStatus: "completed" },
  { orderStatus: "order_confirmed", paymentStatus: "completed" },
  { orderStatus: "order_confirmed", paymentStatus: "completed" },
  { orderStatus: "preparing", paymentStatus: "completed" },
  { orderStatus: "preparing", paymentStatus: "completed" },
  { orderStatus: "shipping_prep", paymentStatus: "completed" },
  { orderStatus: "shipping", paymentStatus: "completed" },
  { orderStatus: "shipping", paymentStatus: "completed" },
  { orderStatus: "delivered", paymentStatus: "completed" },
  { orderStatus: "work_completed", paymentStatus: "completed" },
  { orderStatus: "work_completed", paymentStatus: "completed" },
  { orderStatus: "picked_up", paymentStatus: "completed" },
  { orderStatus: "picked_up", paymentStatus: "completed" },
  { orderStatus: "payment_pending", paymentStatus: "not_started" },
  { orderStatus: "payment_completed", paymentStatus: "completed" },
  { orderStatus: "order_confirmed", paymentStatus: "completed" },
  { orderStatus: "preparing", paymentStatus: "completed" },
  { orderStatus: "shipping_prep", paymentStatus: "completed" },
  { orderStatus: "shipping", paymentStatus: "completed" },
  { orderStatus: "delivered", paymentStatus: "completed" },
  { orderStatus: "work_completed", paymentStatus: "completed" },
  { orderStatus: "canceled", paymentStatus: "canceled" },
  { orderStatus: "canceled", paymentStatus: "canceled" },
  { orderStatus: "order_confirmed", paymentStatus: "completed" },
  { orderStatus: "preparing", paymentStatus: "completed" },
  { orderStatus: "payment_completed", paymentStatus: "completed" },
  { orderStatus: "shipping_prep", paymentStatus: "completed" },
  { orderStatus: "visit_scheduled", paymentStatus: "completed" },
  { orderStatus: "store_visit_scheduled", paymentStatus: "completed" },
];

const BATTERY_TALK_SEQS = new Set([2, 4, 6, 8, 10, 12, 15, 18, 22, 25, 28]);
const INQUIRY_SEQS = new Set([3, 7, 11, 14, 17, 21, 25, 29]);
const PRODUCT_QNA_SEQS = new Set([1, 5, 9, 13, 20, 26]);
const CLAIM_CONFIG: Record<
  number,
  { claimType: ClaimType; claimReason: ClaimReasonCode; claimMessage: string }
> = {
  24: { claimType: "EXCHANGE", claimReason: "wrong_spec", claimMessage: "단자 방향이 달라 교환 요청합니다. 규격 착오 가능성 있습니다." },
  26: { claimType: "CANCEL", claimReason: "change_of_mind", claimMessage: "일정 변경으로 주문 취소 요청드립니다." },
  27: { claimType: "RETURN", claimReason: "order_mistake", claimMessage: "오주문으로 반품 요청합니다. 차량 규격을 잘못 선택했습니다." },
  28: { claimType: "EXCHANGE", claimReason: "wrong_spec", claimMessage: "배터리 규격이 맞지 않아 교환 문의드립니다." },
  30: { claimType: "RETURN", claimReason: "battery_return", claimMessage: "폐배터리 미반납 추가금이 예상과 달라 반품 상담 요청합니다." },
};

const SCENARIO_SUMMARIES: string[] = [
  "네이버 광고 클릭 후 시동 불량 급함, 출장 교체 희망",
  "차종 검색 후 IG/HG 세대 혼동, 배터리톡으로 규격 확인",
  "규격 AGM80L만 알고 유입, 차량 미선택 상태 주문",
  "AGM/일반 구분 못함, 상담문의 후 택배 주문",
  "폐배터리 반납 절차 모름, 고객센터 문의",
  "미반납 선택 후 추가금 문의, 매장 교체",
  "가격 비교 후 내방 할인 매장 교체",
  "출장비 포함 총액 확인 후 출장 주문",
  "택배 수령 후 직접 교체 희망",
  "학장점 내방 할인 문의 후 매장 수령",
  "포터2 사업용 급교체, 전화 콜백 필요",
  "클레임 이력 우려 고객, 규격 재확인 요청",
  "블로그 사례 보고 자사몰 차종검색 유입",
  "당근 소식 보고 규격검색 유입",
  "플레이스 리뷰 보고 상품상세 직접 진입",
  "쏘렌토 하이브리드 규격 확인 필요 시나리오",
  "G80 AGM 트림 확인 배터리톡",
  "스파크 경차 AGM60L 상품문의",
  "카니발 대형 AGM95L 출장 예약",
  "모닝 경차 매장 수령",
  "봉고3 상용 100R 택배",
  "G90/EQ900 세대 규격 확인 상담",
  "QM6 LPG CMF 규격 문의",
  "코란도C 디젤 DIN74 출장",
  "포터2 미반납 클레임 연계",
  "마이티 상용 긴급 출장",
  "트랙스 오주문 반품 클레임",
  "렉스턴 스포츠 교환 클레임",
  "SM6 규격 확인 상담문의",
  "스타리아 디젤 규격확인+미반납 반품",
];

function storeForPersona(p: { fulfillment: FulfillmentMethod; store: Ux2StoreChoice }): string | undefined {
  if (p.fulfillment === "delivery") return undefined;
  if (p.store === "undecided") return undefined;
  if (p.store === "deokcheon") return "deokcheon";
  if (p.store === "hakjang") return "hakjang";
  return undefined;
}

function storeLabel(store: Ux2StoreChoice): string {
  if (store === "deokcheon") return "덕천점";
  if (store === "hakjang") return "학장점";
  if (store === "undecided") return "미정(상담후결정)";
  return "택배출고";
}

export function buildUx2Personas(): Ux2Persona[] {
  return VEHICLES.map((v, i) => {
    const seq = i + 1;
    const id = `UX2-${String(seq).padStart(3, "0")}`;
    const features: Ux2Feature[] = ["order"];
    if (BATTERY_TALK_SEQS.has(seq)) features.push("battery_talk");
    if (INQUIRY_SEQS.has(seq)) features.push("inquiry");
    if (PRODUCT_QNA_SEQS.has(seq)) features.push("product_qna");
    if (CLAIM_CONFIG[seq]) features.push("claim");

    const status = ORDER_PLAN[i]!;
    const fulfillment = FULFILLMENTS[i]!;
    const store = STORES[i]!;
    const claim = CLAIM_CONFIG[seq];

    const persona: Ux2Persona = {
      id,
      seq,
      name: NAMES[i]!,
      scenarioSummary: SCENARIO_SUMMARIES[i]!,
      acquisitionChannel: CHANNELS[i]!,
      customerArchetype: ARCHETYPES[i]!,
      ...v,
      fulfillment,
      store,
      returnBattery: NO_RETURN_SEQS.has(seq) ? "no_return" : "return",
      orderStatus: status.orderStatus,
      paymentStatus: status.paymentStatus,
      priorityToday: seq <= 8 || seq === 11 || seq === 25,
      phoneCallbackNeeded: seq === 1 || seq === 11 || seq === 25 || seq === 30,
      features,
      searchQuery: v.searchQuery,
    };

    if (BATTERY_TALK_SEQS.has(seq)) {
      const talkMsgs: Record<number, string> = {
        25: "포터2 사업차인데 오늘 안에 교체 가능할까요? 배터리톡으로 먼저 규격 확인 부탁드립니다.",
      };
      persona.batteryTalkMessage =
        talkMsgs[seq] ??
        (v.specConfidence === "needs_verification"
          ? `${v.vehicle} ${v.fuel}인데 ${v.batteryCode} 맞나요? ${v.specNote ?? "옵션 때문에 헷갈려요."}`
          : `${v.vehicle}에 ${v.batteryCode} 주문하려는데 단자 방향 L 맞는지 확인 부탁드려요.`);
      persona.adminReply = `${v.vehicle}는 연료·트림에 따라 달라질 수 있어 차량 정보 확인 후 안내드리겠습니다.`;
    }

    if (INQUIRY_SEQS.has(seq)) {
      const msgs: Record<number, string> = {
        3: "AGM 배터리랑 일반 배터리 차이가 뭔가요? 제 차에 뭘 써야 하나요?",
        7: "스타리아 디젤인데 AGM95L이 맞는지 확신이 없습니다. 확인 부탁드립니다.",
        11: "쏘렌토 MQ4 하이브리드 배터리 규격이 헷갈려요. 출장 교체 가능한가요?",
        14: "모닝 어반 매장 수령 가능한가요? 폐배터리는 어떻게 반납하나요?",
        17: "G80 가솔린 AGM95L 재고와 출장비 알려주세요.",
        21: "G90/EQ900 계열인데 세대별 규격이 다른지 모르겠어요.",
        25: "포터2 사업차인데 오늘 안에 교체 가능할까요? 전화 부탁드립니다.",
        29: "SM6 규격 문의드립니다. 택배로 받아 직접 교체해도 되나요?",
      };
      persona.inquiryMessage = msgs[seq] ?? `${v.vehicle} 배터리 교체 문의드립니다.`;
      persona.inquiryCategory = seq % 2 === 0 ? "visit" : "spec";
    }

    if (PRODUCT_QNA_SEQS.has(seq)) {
      const msgs: Record<number, string> = {
        1: "그랜저 IG AGM80L 단자 L 재고 있나요?",
        5: "싼타페 DM DIN74L 택배 발송 며칠 걸리나요?",
        9: "K8 하이브리드 AGM80L 매칭 맞나요?",
        13: "모닝 AGM60L 경차 규격 맞는지 확인해주세요.",
        20: "스파크 AGM60L 최저가와 내방 할인 차이 알려주세요.",
        26: "트랙스 AGM70L 오늘 학장점 수령 가능한가요?",
      };
      persona.productQnaMessage = msgs[seq] ?? `${v.batteryCode} 상품 문의드립니다.`;
    }

    if (claim) {
      persona.claimType = claim.claimType;
      persona.claimReason = claim.claimReason;
      persona.claimMessage = claim.claimMessage;
    }

    return persona;
  });
}

export function ux2StoreDisplayLabel(persona: Ux2Persona): string {
  if (persona.fulfillment === "delivery") return "택배출고";
  const sid = storeForPersona(persona);
  if (!sid) return storeLabel(persona.store);
  return sid === "deokcheon" ? "덕천점" : "학장점";
}

export { storeForPersona, storeLabel };
