/**
 * 배터리 가이드 콘텐츠 — data 파일 기반 (추후 DB/API 교체용)
 * 관리자 업로드: src/data/battery-guide-posts.ts 또는 향후 /admin/content 연동
 */

export type GuidePostCategory =
  | "battery_spec"
  | "symptom"
  | "order_check"
  | "photo_check";

export type GuidePost = {
  id: string;
  category: GuidePostCategory;
  title: string;
  summary: string;
  content: string;
  tags: string[];
  thumbnail?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export const GUIDE_POST_CATEGORY_META: Record<
  GuidePostCategory,
  { label: string; description: string; hubPath: string }
> = {
  battery_spec: {
    label: "배터리 규격 가이드",
    description: "AGM·DIN 규격, 단자 방향, CCA/Ah 등 실무 안내",
    hubPath: "/guide/spec",
  },
  symptom: {
    label: "방전·증상 가이드",
    description: "시동 지연, 방전, 경고등 등 증상별 확인",
    hubPath: "/guide/symptoms",
  },
  order_check: {
    label: "주문 전 확인 가이드",
    description: "오주문 방지·주문 전 점검 포인트",
    hubPath: "/order-checklist",
  },
  photo_check: {
    label: "사진 확인 가이드",
    description: "라벨·단자·트레이 사진으로 규격 확인",
    hubPath: "/photo-check",
  },
};

const now = "2026-06-01";

export const BATTERY_GUIDE_POSTS: GuidePost[] = [
  {
    id: "spec-agm-din-basics",
    category: "battery_spec",
    title: "AGM과 DIN 규격, 무엇이 다른가요?",
    summary: "차종별로 AGM·DIN·R/L 단자가 달라질 수 있습니다. 규격 코드만 보고 주문하면 오주문이 날 수 있습니다.",
    content:
      "AGM 배터리는 ISG·스마트 충전 차량에 많이 쓰이고, DIN은 유럽식 규격 표기입니다. 같은 차종이라도 연식·연료·트림에 따라 규격이 달라질 수 있으니 차종 검색 결과와 라벨을 함께 확인하세요.\n\n단자 방향(L/R)이 맞지 않으면 케이블이 닿지 않습니다. 주문 전 단자 사진을 한 장만 확인해도 실수를 줄일 수 있습니다.",
    tags: ["AGM", "DIN", "규격"],
    isPublished: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "spec-terminal-lr",
    category: "battery_spec",
    title: "단자 방향 L/R 확인 방법",
    summary: "규격이 맞아도 단자 방향이 다르면 장착이 어렵습니다.",
    content:
      "배터리 위에서 보면 +극(플러스) 케이블이 붙는 쪽이 기준입니다. 기존 배터리를 그대로 두고 위에서 촬영하면 L/R 판단이 쉽습니다.\n\n교체 전 사진을 남겨 두면 상담 시 빠르게 확인할 수 있습니다.",
    tags: ["단자", "L/R"],
    isPublished: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "symptom-slow-crank",
    category: "symptom",
    title: "시동이 늦게 걸릴 때",
    summary: "한 번에 안 걸리거나 크랭킹이 길어지면 배터리·충전·누전을 의심합니다.",
    content:
      "겨울철에는 배터리 성능 저하로 시동이 무거워질 수 있습니다. 블랙박스·액세서리 상시 전원도 방전 원인이 됩니다.\n\n완충 후에도 반복되면 교체 시기를 검토하세요.",
    tags: ["시동", "방전"],
    isPublished: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "symptom-blackbox-drain",
    category: "symptom",
    title: "블랙박스·상시전원과 방전",
    summary: "주차 중 대기 전류가 쌓이면 며칠 만에 방전될 수 있습니다.",
    content:
      "컷오프(저전압 차단) 설정 여부를 확인하세요. 배터리만 교체해도 누전이 있으면 다시 방전될 수 있습니다.",
    tags: ["블랙박스", "방전"],
    isPublished: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "order-three-checks",
    category: "order_check",
    title: "주문 전 딱 세 가지만 확인하기",
    summary: "차종·연식, 배터리 규격, 단자 방향만 맞아도 오주문이 크게 줄어듭니다.",
    content:
      "1) 차량명과 연식이 맞는지\n2) 배터리 규격(AGM/DIN 등)\n3) 단자 L/R\n\n폐전지 반납 여부는 금액·회수 절차에 영향을 주니 장바구니에서 함께 선택해 주세요.",
    tags: ["주문", "체크리스트"],
    isPublished: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "order-used-battery",
    category: "order_check",
    title: "폐전지 반납·미반납, 주문 시 선택",
    summary: "반납 조건과 미반납 조건은 금액과 회수 절차가 다릅니다.",
    content:
      "반납 예정이면 새 배터리 수령 후 기존 배터지를 회수해야 합니다. 미반납은 회수 없이 진행하는 조건입니다.\n\n주문 화면에서 선택한 내용과 실제 반납 여부가 다르면 추가 비용이 발생할 수 있습니다.",
    tags: ["폐전지", "반납"],
    isPublished: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "photo-label-shot",
    category: "photo_check",
    title: "라벨 사진, 이렇게 찍어 주세요",
    summary: "규격 코드·제조일이 선명하게 보이도록 정면에서 촬영합니다.",
    content:
      "플래시 반사가 심하면 글자가 안 보입니다. 라벨 전체가 프레임 안에 들어오게 한 장만 보내 주셔도 됩니다.",
    tags: ["사진", "라벨"],
    isPublished: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "photo-terminal-shot",
    category: "photo_check",
    title: "단자·트레이 사진으로 L/R 확인",
    summary: "기존 배터지를 장착한 상태에서 위에서 촬영하면 비교가 쉽습니다.",
    content:
      "케이블이 붙은 위치와 홀드다운 방식이 보이면 상담 시 규격 확정이 빨라집니다.",
    tags: ["사진", "단자"],
    isPublished: true,
    createdAt: now,
    updatedAt: now,
  },
];
