import Link from "next/link";
import { AppIcon } from "@/components/common/AppIcon";
import { HomeSectionShell } from "@/components/common/HomeSectionShell";
import { bm } from "@/lib/design-tokens";
import { HUB_ORDER_CHECKLIST, HUB_PHOTO_CHECK } from "@/lib/platform-hub-routes";
import { HUB_PHOTO } from "@/lib/customer-hub-routes";

export function HomeOrderGuide() {
  return (
    <HomeSectionShell rhythm="order" data-section="order-guide">
      <p className="text-[11px] font-bold text-emerald-800/90">오주문 방지</p>
      <h2 className={`${bm.sectionTitle} mt-1 flex items-center gap-2`}>
        <span className="bm-icon-pill bm-icon-pill--emerald" aria-hidden>
          <AppIcon iconKey="checklist" size="sm" />
        </span>
        주문 전 30초, 연식·연료·단자만 먼저 보세요
      </h2>
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
            헷갈리면 체크리스트와 사진 확인으로 오주문을 줄일 수 있습니다.
          </p>
        </li>
      </ul>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Link className={`${bm.btnNavy} inline-flex items-center justify-center gap-1.5 text-xs`} href={HUB_ORDER_CHECKLIST}>
          <AppIcon iconKey="checklist" size="sm" className="!text-white" />
          오주문 방지 체크리스트
        </Link>
        <Link className={`${bm.btnSecondary} inline-flex items-center justify-center gap-1.5 text-xs`} href={HUB_PHOTO_CHECK}>
          <AppIcon iconKey="photoCheck" size="sm" />
          사진 확인 안내
        </Link>
        <Link className={`${bm.btnGhost} inline-flex items-center gap-1.5 text-xs`} href={HUB_PHOTO}>
          <AppIcon iconKey="photoLabel" size="sm" />
          사진으로 확인
        </Link>
      </div>
    </HomeSectionShell>
  );
}
