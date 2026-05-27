import Link from "next/link";
import { QuickFindIcon } from "@/components/platform/QuickFindIcon";
import { bm } from "@/lib/design-tokens";

/** 메인 — 3초 선택: 검색(히어로) · 사진 · 내 차 · 문의 */
const QUICK_FIND = [
  { label: "내 차 기준으로 확인", desc: "차종·연식별 규격", href: "/vehicles", icon: "car" as const },
  { label: "사진으로 확인", desc: "라벨·단자 사진", href: "/analysis/photo", icon: "camera" as const },
  { label: "규격 문의하기", desc: "차종·연식·증상", href: "/ai", icon: "battery" as const },
];

export function HomeQuickFind() {
  return (
    <section className={`${bm.card} ${bm.cardPad}`}>
      <h2 className={bm.titleMd}>바로 시작하기</h2>
      <p className="mt-1 text-xs font-semibold text-slate-500">검색은 위 입력창 · 아래 3가지로도 이동할 수 있습니다.</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {QUICK_FIND.map((item) => (
          <Link
            key={item.label}
            className={`${bm.surfaceMuted} group flex items-center gap-3 px-3.5 py-3.5 transition hover:border-blue-200 hover:bg-white`}
            href={item.href}
          >
            <QuickFindIcon type={item.icon} />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-black text-slate-900 group-hover:text-blue-700">{item.label}</span>
              <span className="mt-0.5 block text-[10px] font-medium text-slate-500">{item.desc}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
