"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

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
      if (window.daum?.Postcode) {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("postcode script failed")), {
        once: true,
      });
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

function waitForLayerHost(host: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    const host = layerRef.current;
    if (!host) return;
    await waitForLayerHost(host);
    await loadDaumPostcodeScript();
    const Postcode = window.daum?.Postcode;
    if (!Postcode) throw new Error("Postcode unavailable");
    host.innerHTML = "";
    new Postcode({
      oncomplete: handleComplete,
      width: "100%",
      height: "100%",
    }).embed(host);
  }, [handleComplete]);

  const openSearch = useCallback(async () => {
    setLoading(true);
    try {
      if (window.innerWidth < 640) {
        setLayerOpen(true);
        await embedMobileLayer();
        return;
      }

      await loadDaumPostcodeScript();
      const Postcode = window.daum?.Postcode;
      if (!Postcode) throw new Error("Postcode unavailable");
      new Postcode({ oncomplete: handleComplete }).open();
    } catch {
      window.alert("주소 검색을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
      setLayerOpen(false);
    } finally {
      setLoading(false);
    }
  }, [embedMobileLayer, handleComplete]);

  useEffect(() => {
    if (!layerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLayerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [layerOpen]);

  const layer =
    layerOpen && mounted ? (
      <>
        <button
          type="button"
          className="checkout-postcode-layer__backdrop fixed inset-0 z-[200] bg-slate-900/40"
          aria-label="주소 검색 닫기"
          onClick={() => setLayerOpen(false)}
        />
        <div
          className="checkout-postcode-layer fixed inset-x-0 bottom-0 z-[201] mx-auto flex max-h-[min(88vh,680px)] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-2xl"
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
          <div
            ref={layerRef}
            className="checkout-postcode-layer__embed min-h-[min(60vh,480px)] flex-1"
          />
        </div>
      </>
    ) : null;

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

      {layer && mounted ? createPortal(layer, document.body) : null}
    </>
  );
}
