import { GuideSubPage } from "@/components/guide/GuideSubPage";

export default function GuideAsPage() {
  return (
    <GuideSubPage
      title="AS"
      description="보증·교환·상담 안내입니다. 확정되지 않은 정책은 상담 시 안내드립니다."
      sections={[
        {
          heading: "문의 전 확인",
          items: [
            "차량명·연식·현재 배터리 규격",
            "증상 발생 시점·시동 가능 여부",
            "택배 주문 시 반납/미반납 선택 여부",
          ],
        },
        {
          heading: "보증·교환",
          items: [
            "보증·교환 조건은 제품·주문 경로별로 다를 수 있습니다.",
            "확정 정책 연동 전까지는 고객센터 문의로 안내드립니다.",
          ],
        },
        {
          heading: "연결 안내",
          items: [
            "매장·출장 문의는 매장·출장 안내 페이지에서 확인하세요.",
            "택배 주문 문의는 배터리 상세의 택배주문 흐름을 이용하세요.",
          ],
        },
      ]}
    />
  );
}
