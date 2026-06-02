import Link from "next/link";
import { AppIcon } from "@/components/common/AppIcon";
import { CtaHierarchy } from "@/components/common/CtaHierarchy";
import { batteryDetailHref, batterySpecHref } from "@/lib/canonical-battery-code";
import { bm } from "@/lib/design-tokens";
import { compareHref } from "@/lib/platform-data";

export function VehicleNavFooter({
  vehicleId,
  batteryCode = "AGM80L",
}: {
  vehicleId: string;
  batteryCode?: string;
}) {
  const specHref = batterySpecHref(batteryCode);

  return (
    <section className={`${bm.card} ${bm.cardPad}`} data-ux="vehicle-nav-footer" data-primary-battery={batteryCode}>
      <p className="mb-3 flex items-center gap-1.5 text-xs font-black text-slate-600">
        <AppIcon iconKey="route" size="sm" />
        다음 단계
      </p>
      <CtaHierarchy
        ctas={[
          { label: "해당 규격 보기", href: specHref },
          { label: "택배주문", href: `${batteryDetailHref(batteryCode)}#battery-order` },
        ]}
        links={[
          { label: "매장·출장 안내", href: "/service-center" },
          { label: "배터리 가이드", href: "/guides" },
          { label: "사진으로 확인 (보조)", href: "/photo-check" },
          { label: "규격 비교", href: compareHref(batteryCode, "DIN74L") },
        ]}
      />
      <details className="group mt-4">
        <summary className="cursor-pointer text-xs font-black text-slate-600 marker:content-none">
          <span className="inline-flex items-center gap-1">
            관련 링크
            <span className="text-[10px] font-bold text-slate-400 group-open:hidden">펼치기</span>
            <span className="hidden text-[10px] font-bold text-slate-400 group-open:inline">접기</span>
          </span>
        </summary>
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
          <Link className={`${bm.btnTertiary} text-[11px]`} href="/shop">
            택배주문
          </Link>
          <Link className={`${bm.btnTertiary} text-[11px]`} href="/guides">
            배터리 가이드
          </Link>
          <Link className={`${bm.btnTertiary} text-[11px]`} href="/photo-check">
            사진 확인 (보조)
          </Link>
        </div>
      </details>
    </section>
  );
}
