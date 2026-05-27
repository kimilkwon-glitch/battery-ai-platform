import { getVehicleAsset, vehicleAssetBrandLabel, vehicleAssets } from "./car-assets";
import { vehicles as platformVehicles } from "./platform-data";
import { getVehicleCardBatteryInfo } from "./vehicleBattery";

export type VehicleDetail = {
  slug: string;
  manufacturer: string;
  model: string;
  year: string;
  fuel: string;
  isg: string;
  agm: string;
  recommendedBattery: string;
  healthScore: string;
  confidence: string;
  heroSummary: string;
  imageTone: string;
  telemetry: [string, string, string][];
  compatibility: {
    model: string;
    fit: string;
    status: string;
    note: string;
    warnings: string[];
  }[];
  upgrades: string[];
  alternatives: string[];
  bms: string;
  diagnosis: {
    title: string;
    risk: string;
    detail: string;
    tone: string;
  }[];
  specs: {
    model: string;
    cca: string;
    rc: string;
    ah: string;
    terminal: string;
    size: string;
    lnDin: string;
  }[];
  symptoms: string[];
  guide: string[];
  cases: {
    title: string;
    meta: string;
    result: string;
  }[];
  aiAnalysis: string[];
  related: {
    slug: string;
    model: string;
    battery: string;
    tag: string;
  }[];
};

export const vehicleDetails: VehicleDetail[] = [
  {
    slug: "sorento-mq4",
    manufacturer: "기아",
    model: "쏘렌토 MQ4",
    year: "2020-2025",
    fuel: "디젤 / 하이브리드 / 가솔린",
    isg: "적용 트림 다수",
    agm: "AGM 권장",
    recommendedBattery: "AGM95L",
    healthScore: "88",
    confidence: "98%",
    heroSummary:
      "쏘렌토 MQ4는 ISG/IBS 적용 트림이 많아 순정 AGM 규격 유지가 안정적입니다. 장착 공간, 터미널 방향, 교체 후 IBS 학습 상태를 함께 확인하는 것이 좋습니다.",
    imageTone: "from-slate-950 via-blue-800 to-cyan-500",
    telemetry: [["OCV", "12.48V", "정상 하한"], ["CCA", "760A", "권장"], ["SOH", "88%", "교체 전"], ["BMS", "IBS", "초기화 확인"]],
    compatibility: [
      {
        model: "AGM95L",
        fit: "추천 98%",
        status: "순정 대체 1순위",
        note: "ISG/IBS 차량의 충전 제어 조건과 가장 안정적으로 맞습니다.",
        warnings: ["교체 후 IBS 학습 확인", "일반 MF 다운그레이드 주의"],
      },
      {
        model: "AGM80L",
        fit: "조건부 84%",
        status: "공간/트림 확인",
        note: "일부 트림에서는 용량 여유가 부족할 수 있어 순정 Ah 확인이 필요합니다.",
        warnings: ["CCA 여유율 확인", "겨울철 시동성 저하 가능"],
      },
      {
        model: "DIN74L",
        fit: "비권장 62%",
        status: "일반 대체 리스크",
        note: "ISG 트림에서 수명과 충전 제어 안정성이 떨어질 수 있습니다.",
        warnings: ["AGM 다운그레이드", "BMS 오차 가능"],
      },
    ],
    upgrades: ["AGM105L 고용량 업그레이드", "고CCA 프리미엄 AGM", "블랙박스 보조배터리 병행"],
    alternatives: ["AGM95L", "AGM90L", "EFB95L"],
    bms: "IBS 센서 장착 차량은 교체 후 충전 제어 학습 또는 진단기 등록 확인을 권장합니다.",
    diagnosis: [
      {
        title: "블랙박스 대기전력 위험",
        risk: "중상",
        detail: "주차녹화와 짧은 출퇴근 패턴이 겹치면 3-5일 내 OCV가 12.3V대로 내려갈 수 있습니다.",
        tone: "from-red-500 to-orange-400",
      },
      {
        title: "겨울철 방전 위험",
        risk: "상승",
        detail: "영하권에서는 CCA 여유율이 핵심입니다. SOH 80% 이하라면 시동 지연 가능성이 높아집니다.",
        tone: "from-blue-500 to-cyan-400",
      },
      {
        title: "단거리 주행 패턴",
        risk: "주의",
        detail: "10km 미만 반복 주행은 충전 회복 시간이 부족해 AGM 배터리 수명을 줄일 수 있습니다.",
        tone: "from-indigo-500 to-blue-500",
      },
    ],
    specs: [
      { model: "AGM95L", cca: "850A", rc: "170min", ah: "95Ah", terminal: "L", size: "353 x 175 x 190", lnDin: "LN5 / DIN H8" },
      { model: "AGM80L", cca: "800A", rc: "150min", ah: "80Ah", terminal: "L", size: "315 x 175 x 190", lnDin: "LN4 / DIN H7" },
      { model: "DIN74L", cca: "680A", rc: "135min", ah: "74Ah", terminal: "L", size: "278 x 175 x 190", lnDin: "LN3 / DIN H6" },
    ],
    symptoms: ["시동 한 박자 지연", "ISG 작동 중지", "블랙박스 재부팅", "겨울철 경고등"],
    guide: ["메모리 세이버 연결", "마이너스 단자 분리", "AGM95L 장착", "터미널 체결 토크 확인", "IBS 학습/진단 확인"],
    cases: [
      { title: "MQ4 디젤 출퇴근 차량", meta: "주행 42,000km · 블랙박스 상시", result: "AGM95L 교체 후 재방전 없음" },
      { title: "하이브리드 단거리 운행", meta: "OCV 12.28V · SOH 74%", result: "보조 충전 후 3개월 모니터링" },
    ],
    aiAnalysis: ["AGM 다운그레이드는 권장하지 않습니다.", "블랙박스 컷오프는 12.2V 이상을 추천합니다.", "겨울 전 CCA 부하 테스트를 권장합니다."],
    related: [
      { slug: "carnival", model: "카니발", battery: "AGM95L", tag: "패밀리 SUV/MPV" },
      { slug: "santafe-mx5", model: "싼타페 MX5", battery: "AGM95L", tag: "ISG 트림 주의" },
      { slug: "granduer-gn7", model: "그랜저 GN7", battery: "AGM80L", tag: "현대 최신 플랫폼" },
      { slug: "ev9", model: "EV9", battery: "EV 12V", tag: "전기차 보조전원" },
    ],
  },
  {
    slug: "ev6",
    manufacturer: "기아",
    model: "EV6",
    year: "2021-2026",
    fuel: "전기",
    isg: "해당 없음",
    agm: "EV 12V 보조배터리",
    recommendedBattery: "EV 12V 보조배터리",
    healthScore: "81",
    confidence: "91%",
    heroSummary:
      "EV6는 고전압 배터리와 별개로 12V 보조배터리 상태가 문잠금, 통신, 시동 준비에 영향을 줍니다. 반복 방전은 SOH와 대기 전류, 충전 제어 로그를 함께 봐야 합니다.",
    imageTone: "from-slate-950 via-cyan-800 to-blue-400",
    telemetry: [["12V", "12.36V", "주의"], ["SOH", "81%", "모니터링"], ["대기전류", "상승", "원인 추적"], ["BMS", "EV", "로그 확인"]],
    compatibility: [
      {
        model: "EV 12V AGM",
        fit: "추천 91%",
        status: "보조전원 전용",
        note: "EV 보조전원 요구 조건과 충전 제어 특성을 우선 확인합니다.",
        warnings: ["단순 용량 대체 주의", "반복 방전 원인 진단 필요"],
      },
      {
        model: "AGM70L",
        fit: "조건부 78%",
        status: "공간 확인",
        note: "터미널 방향과 고정 브라켓 호환 여부를 함께 확인해야 합니다.",
        warnings: ["EV 충전 패턴 확인", "SOH 초기값 기록"],
      },
      {
        model: "DIN74L",
        fit: "제한 66%",
        status: "진단 후 선택",
        note: "일반 규격 대체 전 EV 보조전원 충전 조건과 보증 범위를 확인하세요.",
        warnings: ["보증 리스크", "저전압 알림 재발 가능"],
      },
    ],
    upgrades: ["EV 전용 AGM", "저온 성능 강화 모델", "상시전원 장치 전력 분리"],
    alternatives: ["EV 12V AGM", "AGM70L", "DIN74L"],
    bms: "EV 보조배터리는 교체 후 진단기에서 저전압 이력과 충전 이벤트를 확인하는 것이 좋습니다.",
    diagnosis: [
      {
        title: "EV 보조배터리 관리",
        risk: "높음",
        detail: "문잠금, 통신 모듈, 원격 제어 사용량이 많으면 12V 부하가 증가할 수 있습니다.",
        tone: "from-cyan-500 to-blue-500",
      },
      {
        title: "단거리/대기 패턴",
        risk: "주의",
        detail: "주차 시간이 길고 원격 조회가 잦으면 보조배터리 충전 회복이 늦어질 수 있습니다.",
        tone: "from-indigo-500 to-sky-400",
      },
      {
        title: "교체 예상 시기",
        risk: "3-6개월",
        detail: "SOH 80% 초반과 저전압 알림이 반복되면 계절 변화 전 교체 계획을 세우는 것이 안전합니다.",
        tone: "from-red-500 to-orange-400",
      },
    ],
    specs: [
      { model: "EV 12V AGM", cca: "620A", rc: "120min", ah: "60Ah", terminal: "L", size: "242 x 175 x 190", lnDin: "LN2 / DIN H5" },
      { model: "AGM70L", cca: "720A", rc: "135min", ah: "70Ah", terminal: "L", size: "278 x 175 x 190", lnDin: "LN3 / DIN H6" },
      { model: "DIN74L", cca: "680A", rc: "135min", ah: "74Ah", terminal: "L", size: "278 x 175 x 190", lnDin: "LN3 / DIN H6" },
    ],
    symptoms: ["저전압 경고", "원격 시동/공조 실패", "문잠금 응답 지연", "반복 방전"],
    guide: ["저전압 이력 확인", "대기전류 측정", "EV 12V 규격 확인", "교체 후 SOH 기록", "충전 이벤트 모니터링"],
    cases: [
      { title: "원격 공조 사용 빈번", meta: "주차 4일 · 앱 조회 잦음", result: "12V 교체와 대기전류 점검 병행" },
      { title: "OTA 이후 저전압 알림", meta: "SOH 79% · OCV 12.21V", result: "EV 전용 AGM 교체 권고" },
    ],
    aiAnalysis: ["반복 방전은 배터리만 교체하면 재발할 수 있습니다.", "대기전류와 충전 이벤트 로그를 함께 확인하세요.", "EV 전용 12V 규격을 우선 권장합니다."],
    related: [
      { slug: "ev9", model: "EV9", battery: "EV 12V", tag: "대형 EV" },
      { slug: "sorento-mq4", model: "쏘렌토 MQ4", battery: "AGM95L", tag: "기아 인기 SUV" },
      { slug: "granduer-gn7", model: "그랜저 GN7", battery: "AGM80L", tag: "BMS 충전 제어" },
      { slug: "santafe-mx5", model: "싼타페 MX5", battery: "AGM95L", tag: "하이브리드 트림" },
    ],
  },
  {
    slug: "bmw-g30",
    manufacturer: "BMW",
    model: "5시리즈 G30",
    year: "2017-2023",
    fuel: "가솔린 / 디젤 / PHEV",
    isg: "Auto Start-Stop",
    agm: "AGM 필수 권장",
    recommendedBattery: "AGM92Ah",
    healthScore: "84",
    confidence: "93%",
    heroSummary:
      "BMW G30은 교체 후 배터리 등록이 중요한 차종입니다. 용량, AGM 타입, IBS 센서 상태를 차량에 등록하지 않으면 충전 제어 오차와 수명 저하가 생길 수 있습니다.",
    imageTone: "from-slate-950 via-slate-800 to-blue-500",
    telemetry: [["OCV", "12.42V", "주의"], ["CCA", "850A", "정상"], ["SOH", "84%", "관찰"], ["등록", "필요", "진단기"]],
    compatibility: [
      {
        model: "AGM92Ah",
        fit: "추천 93%",
        status: "등록 필요",
        note: "순정 용량과 타입을 맞추고 교체 후 배터리 등록을 수행해야 합니다.",
        warnings: ["배터리 등록 필수", "용량 변경 시 코딩 확인"],
      },
      {
        model: "AGM80L",
        fit: "조건부 80%",
        status: "용량 다운 주의",
        note: "차량 옵션과 발전 제어 조건에 따라 여유 용량이 부족할 수 있습니다.",
        warnings: ["Ah 차이 확인", "충전 제어 오차"],
      },
      {
        model: "DIN74L",
        fit: "비권장 58%",
        status: "다운그레이드",
        note: "일반 DIN 규격은 AGM 요구 조건을 충족하지 못할 가능성이 큽니다.",
        warnings: ["AGM 타입 유지", "수명 저하 가능"],
      },
    ],
    upgrades: ["AGM95Ah 프리미엄", "고CCA 유럽 DIN AGM", "교체 후 등록 패키지"],
    alternatives: ["AGM92Ah", "AGM95Ah", "AGM80Ah"],
    bms: "BMW G30은 배터리 교체 후 차량 진단기로 배터리 타입과 용량 등록을 권장합니다.",
    diagnosis: [
      {
        title: "BMS 등록 요구",
        risk: "필수",
        detail: "미등록 상태에서는 발전 제어가 이전 배터리 상태로 계산되어 신품 수명을 줄일 수 있습니다.",
        tone: "from-red-500 to-orange-400",
      },
      {
        title: "단거리 주행 패턴",
        risk: "주의",
        detail: "도심 짧은 주행이 많으면 AGM 충전 회복이 늦어지고 경고 메시지가 반복될 수 있습니다.",
        tone: "from-blue-500 to-cyan-400",
      },
      {
        title: "교체 예상 시기",
        risk: "6개월",
        detail: "SOH 80%대 초반이면 겨울 전 부하 테스트와 등록 이력 확인을 추천합니다.",
        tone: "from-indigo-500 to-blue-500",
      },
    ],
    specs: [
      { model: "AGM92Ah", cca: "850A", rc: "170min", ah: "92Ah", terminal: "L", size: "353 x 175 x 190", lnDin: "LN5 / DIN H8" },
      { model: "AGM80L", cca: "800A", rc: "150min", ah: "80Ah", terminal: "L", size: "315 x 175 x 190", lnDin: "LN4 / DIN H7" },
      { model: "DIN74L", cca: "680A", rc: "135min", ah: "74Ah", terminal: "L", size: "278 x 175 x 190", lnDin: "LN3 / DIN H6" },
    ],
    symptoms: ["배터리 방전 경고", "Start-Stop 비활성", "컴포트 액세스 지연", "전장품 오류"],
    guide: ["트렁크 배터리 접근", "백업 전원 유지", "AGM 동일 용량 장착", "배터리 등록", "충전 전압 확인"],
    cases: [
      { title: "520i 도심 출퇴근", meta: "등록 누락 · 경고 반복", result: "배터리 등록 후 경고 해소" },
      { title: "530d 장거리 차량", meta: "CCA 정상 · SOH 83%", result: "겨울 전 예방 교체 예약" },
    ],
    aiAnalysis: ["BMW는 교체 후 등록 여부가 수명에 직접 영향을 줍니다.", "AGM 타입을 일반 DIN으로 낮추지 않는 것이 좋습니다.", "용량 변경 시 코딩 가능 여부를 확인하세요."],
    related: [
      { slug: "sorento-mq4", model: "쏘렌토 MQ4", battery: "AGM95L", tag: "AGM 대용량" },
      { slug: "grandeur-ig", model: "그랜저 IG", battery: "AGM80L", tag: "세단 인기" },
      { slug: "santafe-mx5", model: "싼타페 MX5", battery: "AGM95L", tag: "ISG SUV" },
      { slug: "ev6", model: "EV6", battery: "EV 12V", tag: "전기차 보조전원" },
    ],
  },
  {
    slug: "grandeur-ig",
    manufacturer: "현대",
    model: "그랜저 IG",
    year: "2016-2019",
    fuel: "가솔린 / LPG",
    isg: "일부 트림 ISG",
    agm: "AGM 권장",
    recommendedBattery: "AGM80L",
    healthScore: "82",
    confidence: "96%",
    heroSummary:
      "그랜저 IG는 ISG 적용 트림에서 AGM80L 유지가 안정적입니다. AGM95L 업그레이드는 공간·CCA·충전 제어를 함께 확인해야 합니다.",
    imageTone: "from-slate-950 via-slate-800 to-blue-600",
    telemetry: [["OCV", "12.44V", "정상"], ["CCA", "780A", "권장"], ["SOH", "82%", "관찰"], ["ISG", "확인", "AGM 유지"]],
    compatibility: [
      { model: "AGM80L", fit: "추천 96%", status: "순정", note: "ISG 트림 표준 규격", warnings: ["터미널 L 확인", "BMS/IBS 확인"] },
      { model: "AGM95L", fit: "업그레이드 88%", status: "용량 업", note: "공간·고정 브라켓 확인 후 선택", warnings: ["Ah 증가", "충전 제어"] },
      { model: "DIN74L", fit: "조건부 72%", status: "일반 대체", note: "ISG 미적용 트림에서만 검토", warnings: ["AGM 다운그레이드 주의"] },
    ],
    upgrades: ["AGM95L 고용량", "고CCA AGM", "블랙박스 컷오프 조정"],
    alternatives: ["AGM80L", "AGM95L", "DIN74L"],
    bms: "ISG/IBS 차량은 교체 후 센서 학습 또는 진단 확인을 권장합니다.",
    diagnosis: [
      { title: "시동 지연", risk: "주의", detail: "SOH 80% 이하·단거리 주행 시 CCA 저하 가능", tone: "from-blue-500 to-cyan-400" },
      { title: "겨울철 방전", risk: "상승", detail: "영하권 CCA 여유율 점검 필요", tone: "from-sky-500 to-blue-400" },
    ],
    specs: [
      { model: "AGM80L", cca: "800A", rc: "150min", ah: "80Ah", terminal: "L", size: "315 x 175 x 190", lnDin: "LN4 / DIN H7" },
      { model: "AGM95L", cca: "850A", rc: "170min", ah: "95Ah", terminal: "L", size: "353 x 175 x 190", lnDin: "LN5 / DIN H8" },
    ],
    symptoms: ["시동 한 박자 지연", "경고등", "블랙박스 방전"],
    guide: ["마이너스 단자 분리", "AGM80L 장착", "터미널 토크", "ISG 학습"],
    cases: [{ title: "IG 출퇴근", meta: "SOH 78%", result: "AGM80L 교체 후 정상" }],
    aiAnalysis: ["AGM95L 업그레이드는 공간 확인 후 진행", "DIN74L 다운그레이드는 ISG 트림에서 비권장"],
    related: [
      { slug: "seltos", model: "셀토스", battery: "AGM60L", tag: "기아 SUV" },
      { slug: "sorento-mq4", model: "쏘렌토 MQ4", battery: "AGM95L", tag: "대형 SUV" },
      { slug: "bmw-g30", model: "BMW G30", battery: "AGM92Ah", tag: "수입 세단" },
    ],
  },
  {
    slug: "seltos",
    manufacturer: "기아",
    model: "셀토스",
    year: "2019-2025",
    fuel: "가솔린",
    isg: "ISG 적용 트림",
    agm: "AGM 권장",
    recommendedBattery: "AGM60L",
    healthScore: "85",
    confidence: "93%",
    heroSummary:
      "셀토스 ISG 트림은 AGM60L 유지가 일반적입니다. AGM70L 업그레이드는 용량·CCA·장착 공간을 확인한 뒤 선택하세요.",
    imageTone: "from-slate-900 via-blue-800 to-cyan-500",
    telemetry: [["OCV", "12.46V", "정상"], ["CCA", "680A", "권장"], ["SOH", "85%", "양호"], ["ISG", "적용", "AGM60L"]],
    compatibility: [
      { model: "AGM60L", fit: "추천 93%", status: "순정", note: "ISG 소형 SUV 표준", warnings: ["규격 확인"] },
      { model: "AGM70L", fit: "업그레이드 86%", status: "용량 업", note: "AGM60L→70L 문의 다수", warnings: ["공간 확인"] },
      { model: "DIN60L", fit: "비권장 60%", status: "다운그레이드", note: "ISG 트림 AGM 유지 권장", warnings: ["수명 저하"] },
    ],
    upgrades: ["AGM70L", "고CCA AGM60L"],
    alternatives: ["AGM60L", "AGM70L"],
    bms: "ISG 차량은 AGM 규격 유지와 교체 후 충전 제어 확인을 권장합니다.",
    diagnosis: [
      { title: "블랙박스 방전", risk: "중상", detail: "상시전원·컷오프 12.2V 이상 권장", tone: "from-red-500 to-orange-400" },
      { title: "시동 지연", risk: "주의", detail: "단거리·겨울철 CCA 점검", tone: "from-blue-500 to-cyan-400" },
    ],
    specs: [
      { model: "AGM60L", cca: "680A", rc: "120min", ah: "60Ah", terminal: "L", size: "242 x 175 x 190", lnDin: "LN2 / DIN H5" },
      { model: "AGM70L", cca: "720A", rc: "135min", ah: "70Ah", terminal: "L", size: "278 x 175 x 190", lnDin: "LN3 / DIN H6" },
    ],
    symptoms: ["시동 지연", "블랙박스 재부팅", "ISG 경고"],
    guide: ["AGM60L 장착", "터미널 체결", "ISG 확인"],
    cases: [{ title: "셀토스 ISG", meta: "AGM70L 문의", result: "공간 확인 후 업그레이드" }],
    aiAnalysis: ["AGM70L 업그레이드는 호환률 86% 수준", "커뮤니티에서 용량업 질문이 많음"],
    related: [
      { slug: "grandeur-ig", model: "그랜저 IG", battery: "AGM80L", tag: "현대 세단" },
      { slug: "sorento-mq4", model: "쏘렌토 MQ4", battery: "AGM95L", tag: "기아 SUV" },
      { slug: "ev6", model: "EV6", battery: "EV 12V", tag: "전기차" },
    ],
  },
];

const fallbackVehicle = vehicleDetails[0];

export function getVehicleDetail(slug: string) {
  const found = vehicleDetails.find((vehicle) => vehicle.slug === slug);
  if (found) return found;
  const pv = platformVehicles.find((v) => v.id === slug);
  if (pv) {
    return {
      slug: pv.id,
      manufacturer: pv.brand,
      model: pv.displayName,
      year: pv.yearRange,
      fuel: pv.fuel,
      isg: "트림별 확인",
      agm: pv.batteryCode.startsWith("DIN") ? "DIN/조건부 AGM" : "AGM 권장",
      recommendedBattery: pv.batteryCode,
      healthScore: "86",
      confidence: "94%",
      heroSummary: `${pv.displayName}은 ${pv.batteryCode} 기준으로 호환·증상·교체 정보를 확인할 수 있습니다.`,
      imageTone: "from-slate-950 via-blue-800 to-cyan-500",
      telemetry: [["순정", pv.batteryCode, "권장"], ["연료", pv.fuel, ""], ["검색", pv.searchVolume, ""]],
      compatibility: [{ model: pv.batteryCode, fit: "추천", status: "순정", note: pv.displayName, warnings: [] }],
      upgrades: pv.upgradeCodes,
      alternatives: pv.upgradeCodes,
      bms: "차종별 확인",
      diagnosis: [],
      specs: [{ model: pv.batteryCode, cca: "-", rc: "-", ah: "-", terminal: "L", size: "-", lnDin: "-" }],
      symptoms: [],
      guide: [],
      cases: [],
      aiAnalysis: [],
      related: platformVehicles.filter((x) => x.id !== slug).slice(0, 3).map((x) => ({ slug: x.id, model: x.displayName, battery: x.batteryCode, tag: x.brand })),
    } as VehicleDetail;
  }

  const asset = getVehicleAsset(slug);
  if (asset) {
    const db = getVehicleCardBatteryInfo(asset.catalogId ?? asset.id);
    const battery =
      (db.hasConfirmedDb && db.displayCode) ||
      db.displayCode ||
      asset.defaultBatteryCode ||
      (db.needsPhotoReview ? "사진 확인 필요" : "정보 준비중");
    return {
      slug: asset.catalogId ?? asset.id,
      manufacturer: vehicleAssetBrandLabel(asset.brand),
      model: asset.displayName,
      year: asset.yearRange ?? "연식별 확인",
      fuel: asset.tags?.includes("EV") ? "전기" : asset.tags?.includes("하이브리드") ? "하이브리드/연료별" : "연료별 확인",
      isg: asset.tags?.includes("하이브리드") ? "HEV/PHEV 트림 확인" : "트림별 확인",
      agm: battery.startsWith("DIN") ? "DIN/조건부 AGM" : battery.startsWith("EV") ? "EV 12V" : "AGM/DIN 확인",
      recommendedBattery: battery,
      healthScore: "—",
      confidence: "검색 매칭",
      heroSummary: asset.batteryNotes ?? `${asset.displayName} 배터리 규격은 연식·연료·ISG 여부에 따라 달라질 수 있습니다.`,
      imageTone: "from-slate-950 via-blue-800 to-cyan-500",
      telemetry: [
        ["차종", asset.displayName, asset.modelGroup],
        ["연식", asset.yearRange ?? "-", ""],
        ["배터리", battery, "확인"],
      ],
      compatibility: [{ model: battery, fit: "확인 필요", status: "차종별", note: asset.batteryNotes ?? asset.displayName, warnings: ["연식·연료 확인"] }],
      upgrades: [],
      alternatives: [],
      bms: asset.batteryNotes ?? "차종별 확인",
      diagnosis: [],
      specs: [{ model: battery, cca: "-", rc: "-", ah: "-", terminal: "L", size: "-", lnDin: "-" }],
      symptoms: asset.aliases.slice(0, 4),
      guide: asset.tags ?? [],
      cases: [],
      aiAnalysis: asset.aliases.slice(0, 3).map((alias) => `"${alias}" 검색으로 이 차종에 도달했습니다.`),
      related: vehicleAssets
        .filter((x) => x.modelGroup === asset.modelGroup && x.id !== asset.id)
        .slice(0, 3)
        .map((x) => ({
          slug: x.catalogId ?? x.id,
          model: x.displayName,
          battery: x.defaultBatteryCode ?? "확인",
          tag: vehicleAssetBrandLabel(x.brand),
        })),
    } as VehicleDetail;
  }

  return fallbackVehicle;
}

export function getVehicleSlugs() {
  const fromPlatform = platformVehicles.map((v) => v.id);
  const legacy = vehicleDetails.map((v) => v.slug);
  const fromAssets = vehicleAssets.map((a) => a.catalogId ?? a.id);
  return [...new Set([...legacy, ...fromPlatform, ...fromAssets])];
}
