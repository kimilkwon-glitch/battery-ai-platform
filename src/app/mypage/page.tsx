import Link from "next/link";
import { PageShell } from "@/components/common/PageShell";
import { AppIcon } from "@/components/common/AppIcon";
import { bm } from "@/lib/design-tokens";
import { getSearchHref } from "@/lib/battery-search";
import { HUB_PHOTO } from "@/lib/customer-hub-routes";
import { HUB_ORDER_CHECKLIST } from "@/lib/platform-hub-routes";

const MY_CTAS = [
  { label: "내 차 배터리 검색하기", href: "/vehicles", icon: "vehicle" as const, tone: "primary" as const },
  { label: "사진으로 확인하기", href: HUB_PHOTO, icon: "photoCheck" as const, tone: "secondary" as const },
  {
    label: "주문 전 체크리스트",
    href: HUB_ORDER_CHECKLIST,
    icon: "checklist" as const,
    tone: "secondary" as const,
  },
];

export default function MyPage() {
  return (
    <PageShell
      zone="auth"
      pageLabel="마이페이지"
      title="마이페이지"
      description="로그인 후 최근 검색·저장한 비교·상담 내역을 확인할 수 있습니다."
      showSearch={false}
    >
      <div className={`${bm.card} ${bm.cardPad} space-y-4`}>
        <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium leading-relaxed text-slate-700 ring-1 ring-slate-200/80">
          현재 상담·택배 주문은 배터리 상세 페이지 또는 채팅 상담을 이용해 주세요. 회원 로그인·주문
          내역은 인증 연동 후 제공됩니다.
        </p>

        <div className="grid gap-3 sm:grid-cols-3">
          {MY_CTAS.map((cta) => (
            <Link
              key={cta.href}
              href={cta.href}
              className={`flex flex-col rounded-xl border p-4 transition motion-safe:duration-200 motion-safe:hover:-translate-y-0.5 ${
                cta.tone === "primary"
                  ? "border-slate-800 bg-slate-900 text-white"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <AppIcon
                iconKey={cta.icon}
                size="sm"
                className={cta.tone === "primary" ? "!text-white" : undefined}
              />
              <span className="mt-2 text-sm font-black">{cta.label}</span>
            </Link>
          ))}
        </div>

        <div className={`${bm.surfaceMuted} p-4`}>
          <p className="text-xs font-bold text-slate-500">빠른 검색</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {["쏘렌토 MQ4", "AGM70L", "포터2 100R"].map((q) => (
              <Link
                key={q}
                href={getSearchHref(q)}
                className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
              >
                {q}
              </Link>
            ))}
          </div>
        </div>

        <p className="text-center text-xs font-semibold text-slate-500">
          <Link href="/login" className="font-black text-blue-700 hover:underline">
            로그인
          </Link>
          <span className="mx-2 text-slate-300">·</span>
          <Link href="/signup" className="font-black text-blue-700 hover:underline">
            회원가입
          </Link>
        </p>
      </div>
    </PageShell>
  );
}
