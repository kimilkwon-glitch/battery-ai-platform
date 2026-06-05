/** 운영자 검수 기준 — 관리자 화면 전용 (고객 화면 미노출) */

export type OperatorReviewRule = {
  slug: string;
  label: string;
  expectedPrimary: string;
  upgradeAllowed?: boolean;
  salesExcluded?: boolean;
  notes?: string;
};

export const OPERATOR_REVIEW_RULES: OperatorReviewRule[] = [
  { slug: "santafe-mx5", label: "싼타페 MX5 가솔린", expectedPrimary: "AGM70L", upgradeAllowed: false },
  { slug: "santafe-mx5-hev", label: "싼타페 MX5 HEV", expectedPrimary: "AGM60L" },
  { slug: "kona-sx2", label: "코나 SX2 가솔린/EV", expectedPrimary: "AGM60L" },
  { slug: "kona-sx2", label: "코나 SX2 하이브리드", expectedPrimary: "—", salesExcluded: true, notes: "리튬 보조배터리 — 납산 판매 제외" },
  { slug: "porter2-ev", label: "포터2 EV", expectedPrimary: "80L" },
  { slug: "niro-sg2", label: "니로 SG2", expectedPrimary: "—", salesExcluded: true, notes: "전 트림 리튬 — 판매 제외" },
  { slug: "bongo3-ev", label: "봉고3 EV", expectedPrimary: "80L" },
  { slug: "renault-arkana-2024", label: "르노 아르카나", expectedPrimary: "AGM60L" },
  { slug: "renault-master-2018", label: "르노 마스터", expectedPrimary: "AGM95L" },
  { slug: "kg-torres-2022", label: "KG 토레스", expectedPrimary: "AGM70L" },
  { slug: "kg-torres-evx-2023", label: "KG 토레스 EVX", expectedPrimary: "60R" },
  { slug: "kg-actyon-2024", label: "KG 액티언", expectedPrimary: "AGM70L" },
  {
    slug: "chevrolet-the-new-cruze-2015",
    label: "쉐보레 더 뉴 크루즈",
    expectedPrimary: "DIN60L/DIN74L/AGM80L",
    notes: "가솔린 DIN60 기본·DIN70급 업그레이드 / 디젤 DIN74·DIN90L / ISG AGM80L",
  },
  { slug: "chevrolet-trailblazer-2024", label: "쉐보레 트레일블레이저", expectedPrimary: "AGM70L" },
  { slug: "chevrolet-equinox-2022", label: "쉐보레 이쿼녹스", expectedPrimary: "AGM70L" },
  { slug: "gmdaewoo-labo-2011", label: "GM대우 라보", expectedPrimary: "50L" },
  { slug: "gmdaewoo-damas-2011", label: "GM대우 다마스", expectedPrimary: "50L" },
  { slug: "chevrolet-bolt-ev-2017", label: "쉐보레 볼트 EV", expectedPrimary: "AGM50L" },
  { slug: "renault-samsung-qm6-quest-2023", label: "QM6 퀘스트", expectedPrimary: "DIN74L", upgradeAllowed: false },
  { slug: "daewoo-tosca-2006", label: "토스카", expectedPrimary: "80R", upgradeAllowed: false },
  { slug: "genesis-gv60", label: "GV60", expectedPrimary: "AGM60L" },
  { slug: "genesis-gv70", label: "GV70", expectedPrimary: "AGM80R" },
  { slug: "genesis-gv80", label: "GV80", expectedPrimary: "AGM95R" },
];

export function findReviewRuleForSlug(slug: string): OperatorReviewRule[] {
  return OPERATOR_REVIEW_RULES.filter((r) => r.slug === slug);
}
