/** 배터리 가이드 허브 — /guides 카테고리별 고객 안내 콘텐츠 */

export type BatteryGuideContentCard = {
  title: string;
  lines: string[];
};

export type BatteryGuideCategoryContent = {
  id: string;
  sectionTitle: string;
  cards: BatteryGuideContentCard[];
};

export const BATTERY_GUIDE_HUB_CONTENT: Record<string, BatteryGuideCategoryContent> = {
  maintenance: {
    id: "maintenance",
    sectionTitle: "배터리 수명을 오래 쓰기 위한 기본 관리",
    cards: [
      {
        title: "장기주차 전 점검",
        lines: [
          "1주 이상 주차 예정이면 블랙박스 주차모드, 실내등, 상시전원 장치를 확인하세요.",
          "주행이 짧은 차량은 충전량이 부족해질 수 있습니다.",
        ],
      },
      {
        title: "계절별 확인",
        lines: [
          "겨울철에는 시동 전압이 떨어지기 쉽고, 여름철에는 내부 열화가 빨라질 수 있습니다.",
          "계절이 바뀔 때 한 번씩 전압과 충전 상태를 확인하는 것이 좋습니다.",
        ],
      },
      {
        title: "단자와 고정 상태",
        lines: [
          "단자 부식, 헐거움, 고정쇠 풀림은 시동 불량의 원인이 될 수 있습니다.",
          "교체 후에도 단자 체결과 고정 상태를 확인해야 합니다.",
        ],
      },
      {
        title: "짧은 주행이 반복되는 차량",
        lines: [
          "짧은 거리만 반복 운행하면 충전이 충분히 되지 않을 수 있습니다.",
          "방전 이력이 있다면 배터리 자체뿐 아니라 충전 상태도 함께 확인해야 합니다.",
        ],
      },
    ],
  },
  symptoms: {
    id: "symptoms",
    sectionTitle: "이런 증상이 있으면 배터리 점검이 필요합니다",
    cards: [
      {
        title: "시동이 늦게 걸림",
        lines: [
          "스타트 모터가 평소보다 무겁게 돌아가거나, 첫 시동이 늦다면 배터리 성능 저하를 의심할 수 있습니다.",
        ],
      },
      {
        title: "계기판 경고등 / 전장품 이상",
        lines: [
          "시동 전후로 경고등이 불안정하거나 전장품 동작이 약하면 전압 상태를 확인해야 합니다.",
        ],
      },
      {
        title: "블랙박스 방전",
        lines: [
          "주차모드 사용 시간이 길거나 차단 전압 설정이 낮으면 방전이 반복될 수 있습니다.",
        ],
      },
      {
        title: "완전 방전 후 재방전",
        lines: [
          "한 번 완전 방전된 배터리는 성능이 크게 떨어질 수 있습니다.",
          "점프 후 다시 방전된다면 교체 여부를 확인하는 것이 좋습니다.",
        ],
      },
    ],
  },
  fault: {
    id: "fault",
    sectionTitle: "배터리 불량과 단순 방전은 다릅니다",
    cards: [
      {
        title: "단순 방전",
        lines: [
          "실내등, 블랙박스, 장기주차 등 외부 원인으로 전력이 소모된 경우입니다.",
          "충전 후 회복되는 경우도 있지만, 반복되면 점검이 필요합니다.",
        ],
      },
      {
        title: "성능 저하",
        lines: [
          "전압은 정상처럼 보여도 CCA가 크게 떨어지면 시동 성능이 부족할 수 있습니다.",
          "오래된 배터리에서 자주 나타납니다.",
        ],
      },
      {
        title: "내부저항 증가",
        lines: [
          "내부저항이 높아지면 순간 출력이 약해지고 충전 효율도 떨어질 수 있습니다.",
        ],
      },
      {
        title: "교체 판단 기준",
        lines: [
          "전압, CCA, 내부저항, 방전 이력, 사용 기간을 함께 보고 판단합니다.",
          "수치 하나만 보고 무조건 교체로 판단하지 않습니다.",
        ],
      },
    ],
  },
  as: {
    id: "as",
    sectionTitle: "교체 후 문제가 있을 때 확인할 내용",
    cards: [
      {
        title: "교체 직후 시동 문제",
        lines: [
          "단자 체결, 고정 상태, 차량 충전 전압을 먼저 확인합니다.",
        ],
      },
      {
        title: "재방전 발생",
        lines: [
          "블랙박스, 상시전원, 발전기, 누설전류 등 차량 쪽 원인도 함께 확인해야 합니다.",
        ],
      },
      {
        title: "보증 확인",
        lines: [
          "제품 보증은 브랜드와 제품 종류에 따라 다를 수 있습니다.",
          "교체일, 제품명, 장착 차량 정보를 확인하면 안내가 빠릅니다.",
        ],
      },
      {
        title: "문의 전 준비하면 좋은 정보",
        lines: [
          "차량명 · 연식 · 장착 배터리 규격 · 증상 발생 시점 · 계기판/배터리 사진",
        ],
      },
    ],
  },
};

export const BATTERY_GUIDE_DEFAULT_CATEGORY = "maintenance";

export function parseBatteryGuideCategory(raw: string | null | undefined): string {
  const id = raw?.trim();
  if (id && id in BATTERY_GUIDE_HUB_CONTENT) return id;
  return BATTERY_GUIDE_DEFAULT_CATEGORY;
}
