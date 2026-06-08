import Link from "next/link";
import { BUSINESS_INFO } from "@/lib/business-config";
import { HUB_STORE_DETAIL } from "@/lib/customer-hub-routes";
import { formatBusinessField, getBusinessInfo } from "@/lib/legal/business-info";
import { bm } from "@/lib/design-tokens";

export function BusinessInfoPanel() {
  const biz = getBusinessInfo();

  return (
    <section className={`${bm.card} ${bm.cardPad} border-l-[3px] border-amber-400`} data-business-info>
      <h2 className="text-sm font-black text-slate-900">사업자 정보</h2>
      <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
        <div>
          <dt className="font-bold text-slate-500">상호</dt>
          <dd className="font-black text-slate-900">{biz.tradeName}</dd>
        </div>
        <div>
          <dt className="font-bold text-slate-500">대표자</dt>
          <dd className="font-medium text-slate-800">{formatBusinessField(biz.representative)}</dd>
        </div>
        <div>
          <dt className="font-bold text-slate-500">사업자등록번호</dt>
          <dd className="font-medium text-slate-800">
            {formatBusinessField(biz.businessRegistrationNumber)}
          </dd>
        </div>
        <div>
          <dt className="font-bold text-slate-500">통신판매업 신고번호</dt>
          <dd className="font-medium text-slate-800">
            {formatBusinessField(biz.mailOrderReportNumber)}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="font-bold text-slate-500">주소</dt>
          <dd className="font-medium text-slate-800">{formatBusinessField(biz.address)}</dd>
        </div>
        <div>
          <dt className="font-bold text-slate-500">이메일</dt>
          <dd className="font-medium text-slate-800">
            <a href={`mailto:${biz.email}`} className="text-blue-700 hover:underline">
              {biz.email}
            </a>
          </dd>
        </div>
        <div>
          <dt className="font-bold text-slate-500">개인정보보호책임자</dt>
          <dd className="font-medium text-slate-800">{formatBusinessField(biz.privacyOfficer)}</dd>
        </div>
      </dl>

      <div className="mt-4 border-t border-slate-100 pt-3">
        <p className="text-[10px] font-black text-slate-500">고객센터</p>
        <ul className="mt-1 space-y-1 text-xs font-bold text-slate-800">
          {biz.customerPhones.map((c) => (
            <li key={c.label}>
              {c.label}:{" "}
              <a href={c.tel} className="text-blue-700 hover:underline">
                {c.phone}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 border-t border-slate-100 pt-3">
        <p className="text-[10px] font-black text-slate-500">운영시간</p>
        <ul className="mt-1 space-y-0.5 text-xs font-medium text-slate-700">
          {biz.businessHoursLines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>

      <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-3">
        <p className="text-[10px] font-black text-slate-500">매장 안내</p>
        <ul className="mt-2 space-y-1.5 text-xs font-medium text-slate-700">
          <li>
            {BUSINESS_INFO.branches.deokcheon.name}:{" "}
            <a
              href={BUSINESS_INFO.branches.deokcheon.tel}
              className="font-bold text-blue-700 hover:underline"
            >
              {BUSINESS_INFO.branches.deokcheon.phone}
            </a>
          </li>
          <li>
            {BUSINESS_INFO.branches.hakjang.name}:{" "}
            <a
              href={BUSINESS_INFO.branches.hakjang.tel}
              className="font-bold text-blue-700 hover:underline"
            >
              {BUSINESS_INFO.branches.hakjang.phone}
            </a>
          </li>
        </ul>
        <Link
          href={HUB_STORE_DETAIL}
          className="mt-2 inline-block text-[11px] font-bold text-blue-700 hover:underline"
        >
          매장 위치·영업 정보 보기
        </Link>
      </div>
    </section>
  );
}
