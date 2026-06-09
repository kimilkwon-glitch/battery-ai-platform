"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { MessageSquare, Star } from "lucide-react";
import { BatteryDetailBodyImages } from "@/components/battery/BatteryDetailBodyImages";
import { BatteryProductQnaPanel } from "@/components/battery/BatteryProductQnaPanel";
import { getBattery } from "@/lib/platform-data";

const TABS = [
  { id: "detail", label: "상품상세정보", panelId: "battery-detail-info" },
  { id: "reviews", label: "리뷰", panelId: "battery-reviews" },
  { id: "qna", label: "상품문의", panelId: "battery-qna" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const panelEase = [0.22, 1, 0.36, 1] as const;

type Props = {
  code: string;
};

export function BatteryDetailProductTabs({ code }: Props) {
  const [tab, setTab] = useState<TabId>("detail");
  const reduceMotion = useReducedMotion();
  const catalogBattery = getBattery(code);
  const reviewsHref = `/reviews?battery=${encodeURIComponent(code)}`;

  const scrollToPanel = useCallback((panelId: string) => {
    if (typeof window === "undefined") return;
    requestAnimationFrame(() => {
      document.getElementById(panelId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  const selectTab = useCallback(
    (id: TabId) => {
      setTab(id);
      const panel = TABS.find((t) => t.id === id);
      if (panel) scrollToPanel(panel.panelId);
    },
    [scrollToPanel],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.replace("#", "");
    if (hash === "battery-reviews") {
      setTab("reviews");
      scrollToPanel("battery-reviews");
    }
  }, [scrollToPanel]);

  return (
    <section
      className="battery-detail-tabs battery-detail-content scroll-mt-24"
      data-battery-product-tabs={code}
    >
      <div className="battery-detail-content__inner">
        <nav
          className="battery-detail-tabs__nav"
          role="tablist"
          aria-label="상품 정보 탭"
        >
          <div className="battery-detail-tabs__rail">
            {TABS.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-controls={t.panelId}
                  id={`battery-tab-${t.id}`}
                  onClick={() => selectTab(t.id)}
                  className="battery-detail-tabs__tab"
                >
                  {t.label}
                  {active && !reduceMotion ? (
                    <motion.span
                      layoutId="battery-detail-tab-indicator"
                      className="battery-detail-tabs__indicator"
                      transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    />
                  ) : active ? (
                    <span className="battery-detail-tabs__indicator" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </nav>

        <AnimatePresence mode="wait">
          {tab === "detail" ? (
            <motion.div
              key="detail"
              role="tabpanel"
              id="battery-detail-info"
              aria-labelledby="battery-tab-detail"
              className="battery-detail-tabs__panel"
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
              transition={{ duration: 0.22, ease: panelEase }}
            >
              <BatteryDetailBodyImages code={code} brandId={catalogBattery.brandId} />
            </motion.div>
          ) : null}

          {tab === "reviews" ? (
            <motion.div
              key="reviews"
              role="tabpanel"
              id="battery-reviews"
              aria-labelledby="battery-tab-reviews"
              className="battery-detail-tabs__panel battery-detail-reviews-panel mt-6"
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
              transition={{ duration: 0.22, ease: panelEase }}
            >
              <div className="battery-detail-reviews-panel__empty">
                <span className="battery-detail-reviews-panel__icon" aria-hidden>
                  <Star className="size-6" strokeWidth={2} />
                </span>
                <p className="battery-detail-reviews-panel__title">아직 등록된 리뷰가 없습니다</p>
                <p className="battery-detail-reviews-panel__desc">
                  교체 후기를 남겨 주시면 다른 고객의 규격 선택에 도움이 됩니다.
                </p>
                <Link href={reviewsHref} className="battery-detail-reviews-panel__cta">
                  리뷰 페이지 보기
                </Link>
              </div>
            </motion.div>
          ) : null}

          {tab === "qna" ? (
            <motion.div
              key="qna"
              role="tabpanel"
              id="battery-qna"
              aria-labelledby="battery-tab-qna"
              className="battery-detail-tabs__panel battery-detail-qna-panel mt-6"
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
              transition={{ duration: 0.22, ease: panelEase }}
            >
              <BatteryProductQnaPanel batteryCode={code} />
              <p className="battery-detail-qna-panel__hint mt-4 flex items-start gap-2 text-xs font-medium text-slate-500">
                <MessageSquare className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                일반 상담·주문 문의는 고객센터 또는 하단 상담 버튼을 이용해 주세요.
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </section>
  );
}
