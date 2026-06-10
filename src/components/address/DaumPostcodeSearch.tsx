"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type DaumPostcodeResult = {
  postalCode: string;
  address1: string;
};

type DaumPostcodeData = {
  zonecode: string;
  roadAddress: string;
  jibunAddress: string;
  userSelectedType: "R" | "J";
};

type DaumPostcodeConstructor = new (options: {
  oncomplete: (data: DaumPostcodeData) => void;
  width?: string | number;
  height?: string | number;
}) => { open: () => void; embed: (element: HTMLElement) => void };

declare global {
  interface Window {
    daum?: {
      Postcode: DaumPostcodeConstructor;
    };
  }
}

const SCRIPT_SRC = "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
let scriptPromise: Promise<void> | null = null;

function loadDaumPostcodeScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("browser only"));
  if (window.daum?.Postcode) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("postcode script failed")));
      return;
    }
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("postcode script failed"));
    document.head.appendChild(script);
  });

  return scriptPromise;
}

type Props = {
  onSelect: (result: DaumPostcodeResult) => void;
  className?: string;
  label?: string;
  dialogTitle?: string;
};

export function DaumPostcodeSearchButton({
  onSelect,
  className = "",
  label = "주소 검색하기",
  dialogTitle = "주소 검색",
}: Props) {
  const [loading, setLoading] = useState(false);
  const layerRef = useRef<HTMLDivElement>(null);
  const [layerOpen, setLayerOpen] = useState(false);
  const [pendingMobileEmbed, setPendingMobileEmbed] = useState(false);

  const handleComplete = useCallback(
    (data: DaumPostcodeData) => {
      const address1 =
        data.userSelectedType === "R"
          ? data.roadAddress
          : data.jibunAddress || data.roadAddress;
      onSelect({ postalCode: data.zonecode, address1 });
      setLayerOpen(false);
    },
    [onSelect],
  );

  const embedMobileLayer = useCallback(async () => {
    if (!layerRef.current) return;
    await loadDaumPostcodeScript();
    const Postcode = window.daum?.Postcode;
    if (!Postcode) throw new Error("Postcode unavailable");
    layerRef.current.innerHTML = "";
    new Postcode({
      oncomplete: handleComplete,
      width: "100%",
      height: "100%",
    }).embed(layerRef.current);
  }, [handleComplete]);

  const openSearch = useCallback(async () => {
    setLoading(true);
    try {
      if (window.innerWidth < 640) {
        setLayerOpen(true);
        setPendingMobileEmbed(true);
        return;
      }

      await loadDaumPostcodeScript();
      const Postcode = window.daum?.Postcode;
      if (!Postcode) throw new Error("Postcode unavailable");
      new Postcode({ oncomplete: handleComplete }).open();
    } catch {
      window.alert("주소 검색을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }, [handleComplete]);

  useEffect(() => {
    if (!layerOpen || !pendingMobileEmbed) return;
    let cancelled = false;
    void (async () => {
      try {
        await embedMobileLayer();
      } catch {
        if (!cancelled) {
          window.alert("주소 검색을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
          setLayerOpen(false);
        }
      } finally {
        if (!cancelled) {
          setPendingMobileEmbed(false);
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [layerOpen, pendingMobileEmbed, embedMobileLayer]);

  useEffect(() => {
    if (!layerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLayerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [layerOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => void openSearch()}
        disabled={loading}
        className={className}
      >
        {loading ? "불러오는 중…" : label}
      </button>

      {layerOpen ? (
        <>
          <button
            type="button"
            className="checkout-postcode-layer__backdrop fixed inset-0 z-[99] bg-slate-900/40"
            aria-label="주소 검색 닫기"
            onClick={() => setLayerOpen(false)}
          />
          <div
            className="checkout-postcode-layer fixed inset-x-0 bottom-0 z-[100] mx-auto flex max-h-[min(85vh,640px)] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label={dialogTitle}
          >
            <div className="checkout-postcode-layer__head flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3">
              <p className="text-sm font-black text-slate-900">{dialogTitle}</p>
              <button
                type="button"
                onClick={() => setLayerOpen(false)}
                className="rounded-lg px-3 py-1.5 text-xs font-black text-slate-700 ring-1 ring-slate-200"
              >
                닫기
              </button>
            </div>
            <div ref={layerRef} className="checkout-postcode-layer__embed min-h-0 flex-1" />
          </div>
        </>
      ) : null}
    </>
  );
}
