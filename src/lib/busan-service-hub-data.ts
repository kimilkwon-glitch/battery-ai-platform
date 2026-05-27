import { HUB_PHOTO, HUB_STORE_ANCHORS } from "@/lib/customer-hub-routes";



/** 부산 덕천점·학장점 직영 — 매장·출장 대표 허브 */



export const BUSAN_SERVICE_TITLE = "매장·출장";



export const BUSAN_SERVICE_DESCRIPTION =

  "덕천점·학장점 직영과 출장·내방 배터리 교체를 한 페이지에서 안내합니다. 부산 지역은 가까운 직영점 기준으로 일정을 맞춰 안내드립니다.";



export const BUSAN_STORES = [

  {

    id: "deokcheon",

    name: "덕천점",

    tagline: "북구권 생활권 · 승용·SUV 중심",

    areas: ["덕천", "구포", "만덕", "화명", "대저", "동래", "금정"],

    scenarios: ["아파트 지하주차장", "출근 전 시동불량", "장기주차 방전"],

    visit: "내방 교체",

    mobile: "출장 교체 (권역 내)",

  },

  {

    id: "hakjang",

    name: "학장점",

    tagline: "사상구권 업무·물류 · 업무차·화물차·법인차 중심",

    areas: ["학장", "감전", "괘법", "주례", "엄궁", "신평", "장림", "하단"],

    scenarios: ["업무차·화물차", "대형차·법인차", "공업사·정비 연계"],

    visit: "내방 교체",

    mobile: "출장 교체 (권역 내)",

  },

] as const;



export const BUSAN_CAPABILITIES = [

  "일반 배터리 교체",

  "AGM 배터리 교체",

  "ISG/BMS 확인",

  "EV 12V 보조배터리 확인",

  "대형차 배터리",

  "블랙박스 방전 점검",

  "사진 확인 후 규격 안내",

] as const;



export const CONSULT_PREP_ITEMS = [

  "차량명·연식·연료 (가솔린/디젤/하이브리드/LPG)",

  "현재 장착 배터리 사진 (라벨·단자 방향)",

  "시동 불량·방전 등 증상 (있는 경우)",

  "희망 일정·내방/출장 여부",

] as const;



export const BUSAN_SERVICE_CTAS = [

  { label: "사진으로 확인", href: HUB_PHOTO, primary: true },

  { label: "문의하기", href: "/ai", primary: true },

  { label: "덕천점 안내", href: HUB_STORE_ANCHORS.deokcheon, primary: false },

  { label: "학장점 안내", href: HUB_STORE_ANCHORS.hakjang, primary: false },

  { label: "출장 가능 지역 보기", href: HUB_STORE_ANCHORS.regions, primary: false },

] as const;



export const STORE_HUB_SECTIONS = [

  { id: "stores", label: "직영점" },

  { id: "regions", label: "출장 지역" },

  { id: "visit", label: "내방 안내" },

  { id: "consult-prep", label: "상담 준비" },

  { id: "photo-guide", label: "사진 확인" },

] as const;


