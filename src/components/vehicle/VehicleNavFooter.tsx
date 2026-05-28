import Link from "next/link";
import { AppIcon } from "@/components/common/AppIcon";
import { CtaHierarchy } from "@/components/common/CtaHierarchy";
import { bm } from "@/lib/design-tokens";
import { compareHref, guideHref } from "@/lib/platform-data";

export function VehicleNavFooter({
  vehicleId,
  batteryCode = "AGM80L",
}: {
  vehicleId: string;
  batteryCode?: string;
}) {
  const specHref = `/batteries/${encodeURIComponent(batteryCode)}`;

  return (
    <section className={`${bm.card} ${bm.cardPad}`} data-ux="vehicle-nav-footer" data-primary-battery={batteryCode}>
      <p className="mb-3 flex items-center gap-1.5 text-xs font-black text-slate-600">
        <AppIcon iconKey="route" size="sm" />
        다음 단계
      </p>
      <CtaHierarchy
        ctas={[
          { label: `${batteryCode} 규격 상세`, href: specHref },
          { label: "사진으로 확인", href: "/analysis/photo" },
        ]}
        links={[
          { label: "문의하기", href: "/ai" },
          { label: "규격 비교", href: compareHref(batteryCode, "DIN74L") },
          { label: "규격 가이드", href: guideHref("terminal-lr") },
          { label: "이 차량 검색", href: `/search?q=${encodeURIComponent(vehicleId)}` },
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
          <Link className={`${bm.btnTertiary} text-[11px]`} href={specHref}>
            {batteryCode} 규격 상세
          </Link>
          <Link className={`${bm.btnTertiary} text-[11px]`} href="/analysis/photo">
            사진으로 확인
          </Link>
          <Link className={`${bm.btnTertiary} text-[11px]`} href="/ai">
            문의하기
          </Link>
          <Link className={`${bm.btnTertiary} text-[11px]`} href={compareHref(batteryCode, "DIN74L")}>
            규격 비교
          </Link>
          <Link className={`${bm.btnTertiary} text-[11px]`} href={guideHref("terminal-lr")}>
            규격 가이드
          </Link>
          <Link className={`${bm.btnTertiary} text-[11px]`} href={`/search?q=${encodeURIComponent(vehicleId)}`}>
            이 차량 검색
          </Link>
        </div>
      </details>
    </section>
  );
}
