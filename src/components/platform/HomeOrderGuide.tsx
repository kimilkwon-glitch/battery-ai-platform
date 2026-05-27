import Link from "next/link";
import { bm } from "@/lib/design-tokens";

export function HomeOrderGuide() {
  return (
    <section className={bm.warningPanel}>
      <p className="text-[11px] font-black text-amber-800/90">오주문 방지</p>
      <h2 className={`${bm.titleMd} mt-1`}>연식·연료·현재 배터리 사진 확인 필요</h2>
      <ul className="mt-3 space-y-2 text-sm font-semibold leading-relaxed text-slate-700">
        <li>연식·연료·ISG/BMS에 따라 규격이 달라질 수 있습니다.</li>
        <li>확실하지 않으면 장착 중인 배터리 라벨·단자 사진으로 확인하는 것이 가장 안전합니다.</li>
      </ul>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <Link className={`${bm.btnPrimary} justify-center text-xs`} href="/analysis/photo">
          사진으로 확인
        </Link>
        <Link className={`${bm.btnTertiary}`} href="/ai">
          문의하기
        </Link>
      </div>
    </section>
  );
}
