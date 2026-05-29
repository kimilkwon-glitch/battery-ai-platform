import { GuideSubPage } from "@/components/guide/GuideSubPage";

export default function GuideMaintenancePage() {
  return (
    <GuideSubPage
      title="점검·관리 팁"
      description="배터리 수명 관리와 기본 점검 방법을 안내합니다."
      sections={[
        {
          heading: "일상 관리",
          items: [
            "장기주차 시 블랙박스·액세서리 전원을 점검하세요.",
            "계절별로 단자 청결·고정 상태를 확인하세요.",
            "충전 상태가 불안정하면 증상 진단 가이드를 참고하세요.",
          ],
        },
        {
          heading: "블랙박스·액세서리",
          items: [
            "주차 모드·저전압 차단 설정을 확인하세요.",
            "장시간 주차 후 시동이 늦어지면 방전 가능성을 의심합니다.",
          ],
        },
      ]}
    />
  );
}
