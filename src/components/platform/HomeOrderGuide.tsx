import Link from "next/link";
import { HomeSectionShell } from "@/components/common/HomeSectionShell";
import { bm } from "@/lib/design-tokens";
import { HUB_ORDER_CHECKLIST, HUB_PHOTO_CHECK } from "@/lib/platform-hub-routes";
import { HUB_PHOTO } from "@/lib/customer-hub-routes";

export function HomeOrderGuide() {
  return (
    <HomeSectionShell rhythm="order" data-section="order-guide">
      <p className="text-[11px] font-bold text-emerald-800/90">오주문 방지</p>
      <h2 className={`${bm.sectionTitle} mt-1`}>연식·연료·단자 확인 후 주문하세요</h2>
      <ul className="mt-3 list-none space-y-2 p-0">
        <li className={bm.stepItem}>
          <span className={bm.stepNum}>1</span>
          <p className="text-sm font-medium leading-relaxed text-slate-700">
            연식·연료·ISG/BMS에 따라 규격이 달라질 수 있습니다.
          </p>
        </li>
        <li className={bm.stepItem}>
          <span className={bm.stepNum}>2</span>
          <p className="text-sm font-medium leading-relaxed text-slate-700">
            확실하지 않으면 체크리스트와 사진 확인으로 최종 검증하세요.
          </p>
        </li>
      </ul>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Link className={`${bm.btnNavy} justify-center text-xs`} href={HUB_ORDER_CHECKLIST}>
          오주문 방지 체크리스트
        </Link>
        <Link className={`${bm.btnSecondary} justify-center text-xs`} href={HUB_PHOTO_CHECK}>
          사진 확인 안내
        </Link>
        <Link className={`${bm.btnGhost} text-xs`} href={HUB_PHOTO}>
          사진 분석
        </Link>
      </div>
    </HomeSectionShell>
  );
}
