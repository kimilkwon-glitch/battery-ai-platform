import { PageShell } from "@/components/common/PageShell";
import { OrderChecklistClient } from "@/components/platform/hub/OrderChecklistClient";

export const dynamic = "force-dynamic";

export default function OrderChecklistPage() {
  return (
    <PageShell
      pageLabel="오주문 방지"
      title="주문 전 체크리스트"
      description="택배·자가장착·문의 전 차종·연식·단자·규격을 보는 오주문 방지 안내입니다."
      searchPlaceholder="차종·규격 검색"
    >
      <OrderChecklistClient />
    </PageShell>
  );
}
