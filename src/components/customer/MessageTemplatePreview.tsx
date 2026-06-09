"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import clsx from "clsx";
import {
  MESSAGE_TEMPLATE_FILTER_GROUPS,
  MESSAGE_TEMPLATE_VARIABLES,
  ORDER_MESSAGE_GUIDE_COPY,
  ORDER_MESSAGE_TEMPLATES,
  getTemplatesByFilterGroup,
  parseMessageGuideFilter,
  renderOrderMessagePreview,
  type MessageTemplateFilterGroup,
  type OrderMessageTemplate,
} from "@/data/order-message-templates";
import { BankTransferNotice } from "@/components/order/BankTransferNotice";
import { PaymentDeadlineBadge } from "@/components/order/PaymentDeadlineBadge";
import {
  BANK_TRANSFER_MESSAGE_LINKS,
  BANK_TRANSFER_POLICY_LINKS,
} from "@/data/bank-transfer-policy";
import {
  USED_BATTERY_GUIDE_LINKS,
  USED_BATTERY_MESSAGE_LINKS,
} from "@/data/used-battery-return-guide";
import { CUSTOMER_CENTER_HUB } from "@/lib/customer-center-routes";
import { bm } from "@/lib/design-tokens";

const FILTER_TABS: { id: MessageTemplateFilterGroup | "전체"; label: string }[] = [
  { id: "전체", label: "전체" },
  ...MESSAGE_TEMPLATE_FILTER_GROUPS.map((g) => ({ id: g, label: g })),
];

function channelLabel(channel: OrderMessageTemplate["channel"]): string {
  if (channel === "both") return "문자 · 알림톡";
  if (channel === "sms") return "문자(SMS)";
  return "알림톡";
}

function MessageTemplateCard({ template }: { template: OrderMessageTemplate }) {
  const [open, setOpen] = useState(false);
  const preview = renderOrderMessagePreview(template.message);

  return (
    <article
      id={template.id}
      className={`${bm.card} overflow-hidden scroll-mt-24`}
      data-template-id={template.id}
    >
      <button
        type="button"
        className="flex w-full flex-col gap-2 px-4 py-4 text-left sm:px-5"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-[10px] font-black text-white">
            {template.category}
          </span>
          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-800 ring-1 ring-blue-100">
            {channelLabel(template.channel)}
          </span>
          <span className="text-[10px] font-semibold text-slate-400">{template.id}</span>
        </div>
        <h3 className="text-sm font-black text-slate-900">{template.title}</h3>
        <p className="text-xs font-medium text-slate-500">
          발송 시점: {template.trigger}
        </p>
        <p className="line-clamp-2 whitespace-pre-line text-xs font-medium leading-relaxed text-slate-600">
          {preview}
        </p>
        <span className="text-[11px] font-black text-blue-700">
          {open ? "안내 문구 접기" : "안내 문구 펼치기"} →
        </span>
      </button>

      {open ? (
        <div className="border-t border-slate-100 px-4 pb-4 pt-3 sm:px-5">
          <p className="text-xs font-semibold text-slate-500">{template.description}</p>
          {template.caution ? (
            <p className="mt-2 rounded-lg border border-amber-100 bg-amber-50/80 px-3 py-2 text-[11px] font-bold leading-relaxed text-amber-900">
              {template.caution}
            </p>
          ) : null}
          <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50/80 p-3 font-mono text-[11px] font-medium leading-relaxed text-slate-800">
            {preview}
          </pre>
          <div className="mt-3">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
              사용 변수
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {template.variables.map((v) => {
                const meta = MESSAGE_TEMPLATE_VARIABLES.find((m) => m.key === v);
                return (
                  <span
                    key={v}
                    className="rounded-md bg-white px-2 py-0.5 font-mono text-[10px] font-bold text-slate-700 ring-1 ring-slate-200"
                    title={meta?.label}
                  >
                    {meta?.placeholder ?? v}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}

export function OrderMessageGuideClient() {
  const searchParams = useSearchParams();
  const initialGroup = parseMessageGuideFilter(searchParams.get("group"));
  const [activeGroup, setActiveGroup] = useState<MessageTemplateFilterGroup | "전체">(
    initialGroup,
  );

  useEffect(() => {
    setActiveGroup(parseMessageGuideFilter(searchParams.get("group")));
  }, [searchParams]);

  const templates = useMemo(
    () => getTemplatesByFilterGroup(activeGroup),
    [activeGroup],
  );

  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash.slice(1) : "";
    if (!hash) return;
    requestAnimationFrame(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [templates, activeGroup]);

  return (
    <div className="order-message-guide space-y-6" data-page="order-message-guide">
      <Link href={CUSTOMER_CENTER_HUB} className={`${bm.btnTertiary} text-xs`}>
        ← 고객센터
      </Link>

      {(activeGroup === "전체" || activeGroup === "폐전지") && (
        <section className={`${bm.card} ${bm.cardPad} space-y-3 border-emerald-100/80`}>
          <h3 className="text-sm font-black text-slate-900">폐전지 반납·회수 안내</h3>
          <p className="text-xs font-medium leading-relaxed text-slate-600">
            반납 절차·포장·미반납 추가 비용 안내는 폐전지 반납 페이지에서 확인할 수 있습니다.
          </p>
          <Link
            href={USED_BATTERY_GUIDE_LINKS.fullGuide}
            className={`${bm.btnNavy} inline-flex text-xs`}
          >
            폐전지 반납 방법 자세히 보기 →
          </Link>
          <p className="text-xs font-medium text-slate-500">관련 메시지 템플릿 (발송 미연결):</p>
          <ul className="flex flex-wrap gap-x-3 gap-y-1">
            {USED_BATTERY_MESSAGE_LINKS.map((link) => (
              <li key={link.templateId}>
                <a
                  href={`#${link.templateId}`}
                  className="text-[11px] font-bold text-blue-700 hover:underline"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {(activeGroup === "전체" || activeGroup === "주문/결제") && (
        <section className={`${bm.card} ${bm.cardPad} space-y-3 border-blue-100/80`}>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-black text-slate-900">무통장 입금 48시간 정책</h3>
            <PaymentDeadlineBadge />
          </div>
          <BankTransferNotice variant="compact" showCtas={false} />
          <p className="text-xs font-medium text-slate-600">
            관련 안내 메시지 템플릿 (발송 미연결 · 예시):
          </p>
          <ul className="flex flex-wrap gap-x-3 gap-y-1">
            {BANK_TRANSFER_MESSAGE_LINKS.map((link) => (
              <li key={link.templateId}>
                <a
                  href={`#${link.templateId}`}
                  className="text-[11px] font-bold text-blue-700 hover:underline"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <Link
            href={BANK_TRANSFER_POLICY_LINKS.orderGuide}
            className={`${bm.btnTertiary} inline-flex text-[11px]`}
          >
            무통장 입금 정책 전체 보기 →
          </Link>
        </section>
      )}

      <section className={`${bm.card} ${bm.cardPad} border-amber-100/80 bg-amber-50/30`}>
        <p className="text-[11px] font-black uppercase tracking-wide text-amber-800">
          안내 메시지 예시
        </p>
        <h2 className="mt-1 text-lg font-black text-slate-950">
          {ORDER_MESSAGE_GUIDE_COPY.pageTitle}
        </h2>
        <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">
          {ORDER_MESSAGE_GUIDE_COPY.pageDescription}
        </p>
        <p className="mt-2 text-xs font-medium leading-relaxed text-slate-600">
          {ORDER_MESSAGE_GUIDE_COPY.disclaimer}
        </p>
        <p className="mt-3 rounded-lg border border-slate-200/80 bg-white/80 px-3 py-2 text-xs font-bold text-slate-700">
          {ORDER_MESSAGE_GUIDE_COPY.notSendingYet}
        </p>
      </section>

      <div className="flex flex-wrap gap-1.5">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveGroup(tab.id)}
            className={clsx(
              "rounded-full px-3 py-1.5 text-[11px] font-black transition",
              activeGroup === tab.id
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200",
            )}
          >
            {tab.label}
            {tab.id === "전체"
              ? ` (${ORDER_MESSAGE_TEMPLATES.length})`
              : ` (${getTemplatesByFilterGroup(tab.id).length})`}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {templates.map((t) => (
          <MessageTemplateCard key={t.id} template={t} />
        ))}
      </div>

      {templates.length === 0 ? (
        <p className="py-8 text-center text-sm font-medium text-slate-500">
          해당 카테고리에 등록된 템플릿이 없습니다.
        </p>
      ) : null}
    </div>
  );
}
