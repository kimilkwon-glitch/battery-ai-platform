/** 배터리가이드 태그 필터 — filter key 유지, 고객 표시명만 개선 */

export const GUIDE_TAG_LABELS: Record<string, string> = {
  AGM: "AGM 배터리 알아보기",
  DIN: "DIN 배터리 알아보기",
  "L/R": "좌·우 단자 방향",
  규격: "내 차 배터리 규격",
  단자: "단자 모양·방향",
  라벨: "배터리 라벨 읽는 법",
  반납: "폐배터리 반납",
  방전: "방전 증상·대처",
  블랙박스: "블랙박스와 방전",
  사진: "배터리 사진 확인",
  시동: "시동 불량 진단",
  주문: "주문·교체 안내",
  체크리스트: "교체 전 확인사항",
  폐전지: "폐배터리 처리",
};

export function guideTagDisplayLabel(tag: string): string {
  return GUIDE_TAG_LABELS[tag] ?? tag;
}
