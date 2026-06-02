/** 부산 덕천점·학장점 직영 — 매장·출장 대표 허브 */


export const BUSAN_SERVICE_TITLE = "매장·출장";



export const BUSAN_SERVICE_DESCRIPTION =
  "부산 지역은 가까운 직영점 기준으로 빠르게 안내드립니다. 동네명을 입력하면 가까운 지점을 확인할 수 있습니다.";



export const BUSAN_STORES = [
  {
    id: "deokcheon",
    name: "덕천점",
    tagline: "북구·금정·연제권 생활권",
    displayRegions: "북구 · 금정구 · 연제구 · 동래구 · 대저1동",
    areas: ["덕천", "구포", "만덕", "화명", "금정", "연산"],
    scenarios: ["아파트 지하주차장", "출근 전 시동불량", "생활권 출장 중심"],
    visit: "내방 교체",
    mobile: "출장 교체 (권역 내)",
    mapsQuery: "부산 북구 덕천 배터리",
    phone: "010-8339-8316",
    phoneTel: "tel:010-8339-8316",
    imageSrc: "/assets/stores/deokcheon.jpg",
    imageAlt: "부산배터리매니저 덕천점 매장 사진",
  },
  {
    id: "hakjang",
    name: "학장점",
    tagline: "사상·사하·강서·명지권",
    displayRegions: "사상구 · 사하구 · 부산진구 · 대저2동",
    areas: ["학장", "사상", "하단", "명지", "강서", "서면"],
    scenarios: ["업무차·물류차", "산업단지", "서부산 출장 중심"],
    visit: "내방 교체",
    mobile: "출장 교체 (권역 내)",
    mapsQuery: "부산 사상구 학장 배터리",
    phone: "010-8896-8316",
    phoneTel: "tel:010-8896-8316",
    imageSrc: "/assets/stores/hakjang.jpg",
    imageAlt: "부산배터리매니저 학장점 매장 사진",
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



/** 매장·출장 안내 — 방문 전 고객이 알려주면 좋은 최소 정보 */
export const VISIT_OUTBOUND_PREP_ITEMS = [
  "차량명",
  "연식",
  "연료",
  "현재 배터리 규격",
  "방전 증상",
  "시동 가능 여부",
] as const;

export const CONSULT_PREP_ITEMS = [
  "차량명",
  "연식",
  "현재 배터리 규격",
  "방전 증상",
  "지하주차장 여부",
  "시동 가능 여부",
] as const;

export const OUTBOUND_PREP_ITEMS = [
  "차량 위치·연락 가능 번호",
  "지하주차장 여부·진입 제한",
  "시동 가능 여부",
  "차종·연식",
  "현재 배터리 규격·단자 방향",
] as const;



export const BUSAN_REGION_FOOTNOTE =
  "가까운 직영점 기준으로 우선 안내하며, 일정과 현장 상황에 따라 조정될 수 있습니다.";

/** 대표 권역 외 지역 클릭 시 정보 패널 안내 */
export const BUSAN_OUTBOUND_FEE_NOTE =
  "대표 권역 외 지역은 거리와 일정에 따라 별도 출장비가 발생할 수 있습니다. 정확한 가능 여부와 비용은 상담 후 안내드립니다.";


