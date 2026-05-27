import { PortalLayout } from "@/components/portal";
import { CartPageClient } from "@/components/platform/CartPageClient";

export default function CartPage() {
  return (
    <PortalLayout
      title="장바구니"
      description="선택한 배터리 규격 확인 후 교체 문의·작업 가능점 연결"
      breadcrumbs={[{ label: "홈", href: "/" }, { label: "쇼핑", href: "/shop" }, { label: "장바구니" }]}
      sidebar={null}
    >
      <CartPageClient />
    </PortalLayout>
  );
}
