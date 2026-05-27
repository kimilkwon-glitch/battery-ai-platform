"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { CtaHierarchy } from "@/components/common/CtaHierarchy";
import { ContentCoverImage } from "@/components/content/ContentCoverImage";
import { bm } from "@/lib/design-tokens";
import { getBattery, mockPhotoAnalysis, guideHref, compareHref } from "@/lib/platform-data";

type UploadPhase = "idle" | "uploading" | "analyzing" | "result";

const SHOOT_POINTS = [
  { n: 1, title: "배터리 라벨", desc: "규격 코드가 선명하게" },
  { n: 2, title: "+단자 방향", desc: "L/R·플러스 위치 포함" },
  { n: 3, title: "장착 위치", desc: "트레이·고정쇠가 보이게" },
] as const;

const COMMON_MISTAKES = [
  { label: "L/R 단자 반대", href: guideHref("terminal-lr") },
  { label: "DIN/AGM 혼동", href: compareHref("AGM80L", "DIN74L") },
  { label: "제조일자 오인", href: guideHref("manufacture-date") },
] as const;

export function PhotoAnalysisClient({ initialBattery }: { initialBattery?: string }) {
  const [phase, setPhase] = useState<UploadPhase>("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const batteryCode = initialBattery ?? "AGM80L";
  const battery = getBattery(batteryCode);

  const onFile = useCallback((file: File | null) => {
    if (!file) return;
    setFileName(file.name);
    setPreviewUrl(URL.createObjectURL(file));
    setPhase("uploading");
    window.setTimeout(() => {
      setPhase("analyzing");
      window.setTimeout(() => setPhase("result"), 900);
    }, 500);
  }, []);

  const result = phase === "result" ? mockPhotoAnalysis(batteryCode) : null;

  const openPhotoPicker = () => document.getElementById("photo-input")?.click();

  return (
    <div className="space-y-4">
      <section className={`${bm.card} ${bm.cardPad}`}>
        <h1 className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
          사진 3장으로 배터리 규격 확인
        </h1>
        <p className="mt-2 text-sm font-medium text-slate-600">
          라벨 · +단자 방향 · 장착 위치 — 세 장으로 최종 확인합니다.
        </p>
      </section>

      <section className={`${bm.card} overflow-hidden p-0`} data-ux="photo-upload">
        <div className={bm.cardPad}>
          <div
            className={`flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition ${
              phase === "idle"
                ? "border-blue-200 bg-white hover:border-[var(--bm-primary)] hover:bg-blue-50/30"
                : "border-slate-200 bg-slate-50"
            }`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              onFile(e.dataTransfer.files[0] ?? null);
            }}
            onClick={() => phase === "idle" && openPhotoPicker()}
          >
            {phase === "idle" ? (
              <>
                <p className="text-sm font-black text-[var(--bm-primary)]">사진을 업로드하세요</p>
                <p className="mt-1 text-[11px] font-semibold text-slate-500">클릭 또는 드래그 · JPG, PNG</p>
              </>
            ) : phase === "uploading" ? (
              <p className="text-sm font-black text-slate-700">업로드 중…</p>
            ) : phase === "analyzing" ? (
              <p className="text-sm font-black text-[var(--bm-primary)]">규격 분석 중…</p>
            ) : previewUrl ? (
              <div className="relative h-[160px] w-full max-w-sm overflow-hidden rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt="업로드 배터리" className="h-full w-full object-contain" src={previewUrl} />
              </div>
            ) : null}
          </div>

          <input
            id="photo-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0] ?? null)}
          />

          {phase === "idle" ? (
            <button type="button" className={`${bm.btnPrimary} mt-3 w-full`} onClick={openPhotoPicker}>
              사진 선택
            </button>
          ) : null}
        </div>
      </section>

      {result ? (
        <section className={`${bm.card} ${bm.cardPad} ring-2 ring-emerald-100`}>
          <p className={bm.label}>분석 결과</p>
          <h3 className="mt-1 text-lg font-black text-slate-950">
            {result.ocr} · {result.terminal}
          </h3>
          <p className="mt-1 text-sm font-semibold text-slate-600">{result.type}</p>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <ResultRow label="인식 규격" value={result.ocr} />
            <ResultRow label="단자 방향" value={result.terminal} />
            <ResultRow label="제조 정보" value={result.manufacture} />
            <ResultRow highlight label="오주문 위험" value={result.risk} />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link className={bm.btnPrimary} href={`/batteries/${encodeURIComponent(result.battery.code)}`}>
              이 규격 자세히 보기
            </Link>
            <Link className={bm.btnSecondary} href="/analysis/photo">
              사진 다시 올리기
            </Link>
            <Link className={bm.btnTertiary} href={`/vehicle/${result.vehicle.id}`}>
              차량 상세 보기
            </Link>
          </div>
          {fileName ? <p className="mt-2 text-[10px] font-semibold text-slate-400">파일 · {fileName}</p> : null}
        </section>
      ) : null}

      <section className={`${bm.card} overflow-hidden`} data-ux="photo-examples">
        <ContentCoverImage
          contentId="admin-photo-guide-001"
          objectFit="contain"
          roundedClass="rounded-none rounded-t-2xl"
          showTitle={false}
          title=""
          variant="card"
        />
        <div className={bm.cardPad}>
          <h2 className="text-sm font-black text-slate-950">촬영 예시</h2>
          <p className="mt-1 text-[11px] font-medium text-slate-500">라벨·단자·장착 위치가 한눈에 보이게 찍어 주세요.</p>
          <ol className="mt-3 grid gap-2 sm:grid-cols-3">
            {SHOOT_POINTS.map((p) => (
              <li key={p.n} className="rounded-lg bg-slate-50 px-3 py-2.5 ring-1 ring-slate-100">
                <span className="text-[10px] font-black text-blue-600">{p.n}</span>
                <p className="mt-0.5 text-sm font-black text-slate-900">{p.title}</p>
                <p className="text-[11px] font-medium text-slate-500">{p.desc}</p>
              </li>
            ))}
          </ol>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <BrandExample brand="로케트" code="AGM60L" note="AGM · L/R 단자" />
            <BrandExample brand="쏠라이트" code="CMF57412" note="DIN · CMF 표기" />
          </div>
        </div>
      </section>

      <section className={`${bm.card} ${bm.cardPad}`} data-ux="photo-mistakes">
        <h2 className="text-sm font-black text-slate-950">자주 틀리는 사례</h2>
        <div className="mt-3 flex flex-col gap-1.5">
          {COMMON_MISTAKES.map((item) => (
            <Link
              key={item.label}
              className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-black text-slate-700 ring-1 ring-slate-200 hover:bg-blue-50"
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </section>

      <section className={`${bm.card} ${bm.cardPad}`} data-ux="photo-next-step">
        <h2 className="text-sm font-black text-slate-950">다음 단계</h2>
        <div className="mt-3">
          <CtaHierarchy
            ctas={[
              { label: "이 규격 자세히 보기", href: `/batteries/${encodeURIComponent(batteryCode)}` },
              { label: "사진으로 최종 확인", href: "/analysis/photo" },
            ]}
            links={[
              { label: "문의하기", href: "/ai" },
              { label: "택배·쇼핑", href: "/shop#shop-products" },
              { label: "매장·출장", href: "/service-center" },
              { label: "규격 비교", href: compareHref(batteryCode, battery.compareWith[0] ?? "DIN74L") },
            ]}
          />
        </div>
      </section>
    </div>
  );
}

function ResultRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className={`rounded-lg p-2.5 ring-1 ${highlight ? "bg-amber-50 ring-amber-200" : "bg-slate-50 ring-slate-200"}`}
    >
      <p className="text-[10px] font-black text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm font-black text-slate-900">{value}</p>
    </div>
  );
}

function BrandExample({ brand, code, note }: { brand: string; code: string; note: string }) {
  const bat = getBattery(code, brand === "쏠라이트" ? "solite" : "rocket");
  return (
    <div className="rounded-lg bg-slate-50 p-3 ring-1 ring-slate-200">
      <p className="text-xs font-black">
        {brand} · {code}
      </p>
      <p className="mt-0.5 text-[10px] font-semibold text-slate-500">{note}</p>
      <p className="mt-1 text-[10px] font-bold text-[var(--bm-primary)]">{bat.type}</p>
    </div>
  );
}
