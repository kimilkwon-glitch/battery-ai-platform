import Link from "next/link";
import { UsedBatteryNotReturnedNotice } from "@/components/customer/UsedBatteryNotReturnedNotice";
import { UsedBatteryOptionCards } from "@/components/customer/UsedBatteryOptionCards";
import { UsedBatteryPackingNotice } from "@/components/customer/UsedBatteryPackingNotice";
import { UsedBatteryPriceDifference } from "@/components/customer/UsedBatteryPriceDifference";
import { UsedBatteryReturnSteps } from "@/components/customer/UsedBatteryReturnSteps";
import { CustomerConsultCta } from "@/components/support/CustomerConsultCta";
import {
  USED_BATTERY_GUIDE_COPY,
  USED_BATTERY_GUIDE_LINKS,
  USED_BATTERY_MESSAGE_LINKS,
  messageGuideUrlForUsedBatteryTemplate,
} from "@/data/used-battery-return-guide";
import { CUSTOMER_GUIDE_NAV } from "@/data/customer-guide";
import { CUSTOMER_CENTER_HUB } from "@/lib/customer-center-routes";
import { bm } from "@/lib/design-tokens";

export function UsedBatteryReturnGuide() {
  return (
    <div className="used-battery-return-guide space-y-6" data-page="used-battery-return-guide">
      <Link href={CUSTOMER_CENTER_HUB} className={`${bm.btnTertiary} text-xs`}>
        ← 고객센터
      </Link>

      <nav className="flex flex-wrap gap-1.5">
        {CUSTOMER_GUIDE_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-black text-slate-600 hover:bg-blue-50 hover:text-blue-800"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <section className={`${bm.card} ${bm.cardPad} border-emerald-100/80 bg-gradient-to-br from-white to-emerald-50/25`}>
        <p className="text-[11px] font-black uppercase tracking-wide text-emerald-800">
          폐전지 반납
        </p>
        <h1 className="mt-1 text-lg font-black text-slate-950 sm:text-xl">
          {USED_BATTERY_GUIDE_COPY.title}
        </h1>
        <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">
          {USED_BATTERY_GUIDE_COPY.description}
        </p>
        <p className="mt-3 rounded-lg border border-slate-200/80 bg-white/80 px-3 py-2 text-[11px] font-bold text-slate-600">
          {USED_BATTERY_GUIDE_COPY.disclaimer}
        </p>
      </section>

      <UsedBatteryOptionCards />
      <UsedBatteryPriceDifference />
      <UsedBatteryReturnSteps />
      <UsedBatteryPackingNotice />
      <UsedBatteryNotReturnedNotice />

      <section className={`${bm.card} ${bm.cardPad}`}>
        <h2 className="text-sm font-black text-slate-900">연결된 안내 메시지 예시</h2>
        <p className="mt-1 text-xs font-medium text-slate-500">
          실제 발송은 준비 중이며, 문구만 미리보기할 수 있습니다.
        </p>
        <ul className="mt-3 flex flex-col gap-2">
          {USED_BATTERY_MESSAGE_LINKS.map((link) => (
            <li key={link.templateId}>
              <Link
                href={messageGuideUrlForUsedBatteryTemplate(link.templateId)}
                className="text-xs font-bold text-blue-700 hover:underline"
              >
                {link.label} →
              </Link>
            </li>
          ))}
        </ul>
        <Link
          className={`${bm.btnTertiary} mt-3 inline-flex text-xs`}
          href={USED_BATTERY_GUIDE_LINKS.messageGuide}
        >
          폐전지 메시지 전체 보기
        </Link>
      </section>

      <section className={`${bm.card} ${bm.cardPad}`}>
        <h2 className="text-sm font-black text-slate-900">FAQ 바로가기</h2>
        <p className="mt-2 text-xs font-medium text-slate-600">
          폐전지 반납·포장·미반납 관련 자주 묻는 질문을 확인해 주세요.
        </p>
        <Link className={`${bm.btnSecondary} mt-3 inline-flex text-xs`} href={USED_BATTERY_GUIDE_LINKS.faq}>
          폐전지 FAQ 보기 →
        </Link>
      </section>

      <CustomerConsultCta />
    </div>
  );
}
