import Link from "next/link";
import { PageShell } from "@/components/common/PageShell";
import { GUIDE_HUB_ITEMS } from "@/lib/guide-hub-routes";
import { HUB_SYMPTOMS } from "@/lib/platform-hub-routes";
import { HUB_SUPPORT } from "@/lib/customer-hub-routes";
import { bm } from "@/lib/design-tokens";

export default function GuideSymptomsPage() {
  return (
    <PageShell
      zone="guide"
      pageLabel="배터리 가이드"
      title="증상 진단"
      description="시동지연·방전·블랙박스 방전 등 증상별 확인 방법입니다."
    >
      <div className="space-y-6">
        <nav className="flex flex-wrap gap-2">
          {GUIDE_HUB_ITEMS.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="bm-badge bm-badge--guide px-3 py-1.5 hover:opacity-90"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <section className={`${bm.card} ${bm.cardPad}`}>
          <h2 className="text-base font-black text-slate-950">자주 보는 증상</h2>
          <ul className="mt-3 space-y-2">
            {[
              "시동이 늦게 걸리거나 한 번에 안 걸리는 경우",
              "완전 방전 후 시동 불가",
              "반복 방전·야간 방전",
              "블랙박스·액세서리 사용 후 방전",
              "경고등·전압 관련 이상",
            ].map((item) => (
              <li
                key={item}
                className="rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2.5 text-sm font-medium text-slate-700"
              >
                {item}
              </li>
            ))}
          </ul>
          <Link
            href={HUB_SYMPTOMS}
            className={`${bm.btnPrimary} mt-4 inline-flex text-sm`}
          >
            증상별 상세 안내 보기
          </Link>
        </section>

        <p className="text-center text-xs font-medium text-slate-500">
          문의는{" "}
          <Link href={HUB_SUPPORT} className="font-black text-blue-700 hover:underline">
            고객센터
          </Link>
          로 연결해 주세요.
        </p>
      </div>
    </PageShell>
  );
}
