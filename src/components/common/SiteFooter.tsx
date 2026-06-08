import { BRAND_FOOTER, BRAND_NAME } from "@/lib/brand";
import { HUB_REVIEWS } from "@/lib/customer-hub-routes";
import { formatBusinessField, getBusinessInfo } from "@/lib/legal/business-info";
import { LEGAL_FOOTER_LINKS } from "@/lib/legal/legal-routes";
import { bm } from "@/lib/design-tokens";
import { OfficialChannelsStrip } from "@/components/common/OfficialChannelsStrip";
import { BUILD_STAMP } from "@/lib/build-stamp";

const serviceLinks = [["리뷰", HUB_REVIEWS]] as const;

export function SiteFooter({ className = "" }: { className?: string }) {
  const biz = getBusinessInfo();

  return (
    <footer
      className={`${bm.card} ${bm.cardPad} text-[11px] font-semibold text-slate-500 ${className}`}
      data-site-footer
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-start">
        <div className="space-y-3">
          <p className="text-sm font-black text-slate-800">{biz.tradeName}</p>
          <dl className="grid gap-1.5 text-[11px] font-medium text-slate-600 sm:grid-cols-2">
            <div>
              <dt className="inline font-bold text-slate-500">대표 </dt>
              <dd className="inline">{formatBusinessField(biz.representative)}</dd>
            </div>
            <div>
              <dt className="inline font-bold text-slate-500">사업자등록번호 </dt>
              <dd className="inline">{formatBusinessField(biz.businessRegistrationNumber)}</dd>
            </div>
            <div>
              <dt className="inline font-bold text-slate-500">통신판매업 신고번호 </dt>
              <dd className="inline">{formatBusinessField(biz.mailOrderReportNumber)}</dd>
            </div>
            <div>
              <dt className="inline font-bold text-slate-500">이메일 </dt>
              <dd className="inline">
                <a href={`mailto:${biz.email}`} className="text-blue-700 hover:underline">
                  {biz.email}
                </a>
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="inline font-bold text-slate-500">주소 </dt>
              <dd className="inline">{formatBusinessField(biz.address)}</dd>
            </div>
            <div>
              <dt className="inline font-bold text-slate-500">개인정보보호책임자 </dt>
              <dd className="inline">{formatBusinessField(biz.privacyOfficer)}</dd>
            </div>
          </dl>
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">고객센터</p>
            <ul className="space-y-0.5">
              {biz.customerPhones.map((c) => (
                <li key={c.label}>
                  <span className="font-bold text-slate-700">{c.label}</span>
                  {" · "}
                  <a href={c.tel} className="font-black text-blue-700 hover:underline">
                    {c.phone}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">운영시간</p>
            <ul className="space-y-0.5 text-[11px] font-medium text-slate-600">
              {biz.businessHoursLines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        </div>

        <nav className="flex min-w-[12rem] flex-col gap-1.5">
          <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">정책·안내</p>
          {LEGAL_FOOTER_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="font-bold text-slate-700 hover:text-[var(--bm-primary)] hover:underline"
            >
              {item.label}
            </a>
          ))}
          {serviceLinks.map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="font-bold text-slate-600 hover:text-[var(--bm-primary)] hover:underline"
            >
              {label}
            </a>
          ))}
        </nav>
      </div>

      <p className="mt-4 border-t border-slate-100 pt-4 text-[10px] text-slate-400">
        {BRAND_FOOTER}
      </p>
      <OfficialChannelsStrip variant="footer" className="mt-3" />
      <p className="mt-3 text-[10px] text-slate-400">
        © {new Date().getFullYear()} {BRAND_NAME}
        {process.env.NODE_ENV !== "production" ? (
          <>
            <span className="mx-1 text-slate-300">·</span>
            <span className="font-mono" data-build-version={BUILD_STAMP}>
              v {BUILD_STAMP}
            </span>
          </>
        ) : (
          <span className="sr-only" data-build-version={BUILD_STAMP} aria-hidden>
            {BUILD_STAMP}
          </span>
        )}
      </p>
    </footer>
  );
}
