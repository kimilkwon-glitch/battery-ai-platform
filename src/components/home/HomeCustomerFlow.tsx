import Link from "next/link";
import { HomeBenefitsCarousel } from "@/components/home/HomeBenefitsCarousel";
import { HomeCatalogSection } from "@/components/home/HomeCatalogSection";
import { HomePopularBatteryRanking } from "@/components/home/HomePopularBatteryRanking";
import { HomePopularQna } from "@/components/home/HomePopularQna";
import { HomePopularVehicleSearch } from "@/components/home/HomePopularVehicleSearch";
import { AppIcon } from "@/components/common/AppIcon";
import { bm } from "@/lib/design-tokens";
import { getSearchHref } from "@/lib/battery-search";
import { HUB_PHOTO, HUB_STORE_DETAIL } from "@/lib/customer-hub-routes";
import { HUB_ORDER_CHECKLIST } from "@/lib/platform-hub-routes";

const CORE_CTAS = [
  {
    label: "내 차 배터리 찾기",
    href: "/vehicles",
    desc: "차량명·연식·연료",
    tone: "primary" as const,
    icon: "vehicle" as const,
  },
  {
    label: "규격명으로 찾기",
    href: getSearchHref("AGM70L"),
    desc: "AGM · DIN · CMF",
    tone: "secondary" as const,
    icon: "batterySpec" as const,
  },
  {
    label: "사진으로 확인하기",
    href: HUB_PHOTO,
    desc: "라벨·단자 보조 확인",
    tone: "secondary" as const,
    icon: "photoCheck" as const,
  },
];

const BOTTOM_CTAS = [
  { label: "주문 전 체크", href: HUB_ORDER_CHECKLIST },
  { label: "사진 확인", href: HUB_PHOTO },
  { label: "매장·택배 상담", href: HUB_STORE_DETAIL },
];

export function HomeCustomerFlow() {
  return (
    <div className="space-y-10 sm:space-y-12">
      <section className="text-center" data-home-section="core-ctas">
        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">바로 시작</p>
        <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
          {CORE_CTAS.map((cta) => (
            <Link
              key={cta.href}
              href={cta.href}
              className={`group rounded-2xl border p-4 text-left transition motion-safe:duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-md ${
                cta.tone === "primary"
                  ? "border-slate-800 bg-slate-900 text-white shadow-[var(--bm-shadow-md)]"
                  : "border-slate-200/90 bg-white hover:border-slate-300"
              }`}
            >
              <span
                className={`inline-flex size-9 items-center justify-center rounded-xl ${
                  cta.tone === "primary" ? "bg-white/15" : "bg-slate-100"
                }`}
              >
                <AppIcon
                  iconKey={cta.icon}
                  size="sm"
                  className={cta.tone === "primary" ? "!text-white" : undefined}
                />
              </span>
              <p className="mt-2 text-sm font-black">{cta.label}</p>
              <p
                className={`mt-0.5 text-xs font-medium ${
                  cta.tone === "primary" ? "text-slate-300" : "text-slate-500"
                }`}
              >
                {cta.desc}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <HomeBenefitsCarousel />

      <HomePopularBatteryRanking />

      <div className="flex justify-center">
        <Link className={`${bm.btnSecondary} text-xs`} href="/shop">
          전체 규격 보기
        </Link>
      </div>

      <HomePopularVehicleSearch />

      <HomePopularQna />

      <section
        className={`${bm.card} ${bm.cardPad} border-slate-200/90`}
        data-home-section="order-hub"
      >
        <h2 className={bm.sectionTitle}>주문 전에 한 번 더 확인</h2>
        <p className="mt-1 text-sm font-medium text-slate-600">
          체크리스트·사진 확인·매장 안내로 오주문을 줄일 수 있습니다.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {BOTTOM_CTAS.map((cta, i) => (
            <Link
              key={cta.href}
              href={cta.href}
              className={
                i === 0 ? `${bm.btnNavy} text-xs` : i === 1 ? `${bm.btnSecondary} text-xs` : `${bm.btnTertiary} text-xs`
              }
            >
              {cta.label}
            </Link>
          ))}
        </div>
      </section>

      <HomeCatalogSection />
    </div>
  );
}
