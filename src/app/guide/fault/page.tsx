import { GuideSubPage } from "@/components/guide/GuideSubPage";

export default function GuideFaultPage() {
  return (
    <GuideSubPage
      title="배터리 불량 안내"
      description="교체 필요 신호와 불량 의심 기준을 안내합니다."
      sections={[
        {
          heading: "불량 의심 신호",
          items: [
            "전압이 지속적으로 낮거나 충전 후에도 회복이 느린 경우",
            "CCA(시동 전류) 저하로 시동이 반복적으로 어려운 경우",
            "단순 방전과 달리 충전·점검 후에도 증상이 반복되는 경우",
          ],
        },
        {
          heading: "교체 판정",
          items: [
            "차종·연식·장착 조건에 따라 판정이 달라질 수 있습니다.",
            "라벨·단자·규격명을 함께 확인한 뒤 상담해 주세요.",
          ],
        },
      ]}
    />
  );
}
