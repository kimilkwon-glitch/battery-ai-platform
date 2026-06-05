import Link from "next/link";
import { HUB_PHOTO } from "@/lib/customer-hub-routes";

export function VehicleSearchCatalogFooter() {
  return (
    <p className="text-xs font-medium leading-relaxed text-slate-500">
      같은 규격이라도 차량 상태나 장착 배터리에 따라 확인이 필요할 수 있습니다. 확실하지 않다면{" "}
      <Link href={HUB_PHOTO} className="font-bold text-blue-700 underline-offset-2 hover:underline">
        사진으로 확인
      </Link>
      을 이용해 주세요.
    </p>
  );
}
