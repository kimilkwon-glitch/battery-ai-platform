"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BatteryDetailBodyImages } from "@/components/battery/BatteryDetailBodyImages";
import { BatteryProductQnaPanel } from "@/components/battery/BatteryProductQnaPanel";
import { BatteryProductReviewsPanel } from "@/components/battery/BatteryProductReviewsPanel";
import { brands, getBattery } from "@/lib/platform-data";

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
  const brandLabel = brands.find((b) => b.id === catalogBattery.brandId)?.displayName ?? "";
  const productDisplayName = [brandLabel, catalogBattery.code].filter(Boolean).join(" ");

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
              <BatteryProductReviewsPanel batteryCode={code} />
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
              <BatteryProductQnaPanel
                batteryCode={code}
                productName={productDisplayName || code}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </section>
  );
}
