"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SmartNextActions } from "@/components/common/SmartNextActions";
import { buildContextFromSymptom } from "@/lib/navigationGraph";
import { getFuelOptionsForVehicle, resolveVehicleIdFromName, riskTone } from "@/lib/diagnosis-result";
import { mockDiagnosisResult, symptoms } from "@/lib/platform-data";

const PRIMARY_SYMPTOM_IDS = [
  "slow-engine-start",
  "blackbox-drain",
  "winter-discharge",
  "ev12v-discharge",
  "agm-replacement",
  "bms-warning",
] as const;

const STEP_LABELS = ["증상 선택", "차량 정보", "사용 환경", "결과 확인"] as const;

function SymptomIcon({ id }: { id: string }) {
  const cls = "size-5 shrink-0";
  switch (id) {
    case "slow-engine-start":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M8 3.5h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "blackbox-drain":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="4" y="7" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="17" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
          <path d="M7 4v3M11 4v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "winter-discharge":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M12 3v18M5 8l14 8M19 8L5 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "ev12v-discharge":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M4 14h12l2-4H6l-2 4z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M7 17h2M13 17h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M18 10v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "agm-replacement":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="5" y="8" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
          <path d="M8 8V6a4 4 0 018 0v2" stroke="currentColor" strokeWidth="1.8" />
          <path d="M9 13h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "bms-warning":
    case "battery-warning":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="5" y="5" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="1.8" />
          <path d="M9 10h2v5H9zM13 10h2v5h-2z" fill="currentColor" />
          <path d="M8 16h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 8v5M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
  }
}

function riskClass(tone: ReturnType<typeof riskTone>) {
  if (tone === "red") return "text-red-600 bg-red-50 ring-red-100";
  if (tone === "amber") return "text-amber-700 bg-amber-50 ring-amber-100";
  return "text-blue-700 bg-blue-50 ring-blue-100";
}

function StepHeader({ step }: { step: number }) {
  return (
    <nav className="mb-4 flex flex-wrap gap-2" aria-label="진단 단계">
      {STEP_LABELS.map((label, i) => {
        const n = i + 1;
        const active = step === n;
        const done = step > n;
        return (
          <span
            key={label}
            className={`rounded-lg px-3 py-1 text-[10px] font-semibold ring-1 ${
              active
                ? "bg-blue-600 text-white ring-blue-600"
                : done
                  ? "bg-blue-50 text-blue-700 ring-blue-100"
                  : "bg-slate-50 text-slate-400 ring-slate-200"
            }`}
          >
            {n}. {label}
          </span>
        );
      })}
    </nav>
  );
}

export function DiagnosisFlowClient() {
  const [step, setStep] = useState(1);
  const [symptomId, setSymptomId] = useState("slow-engine-start");
  const [vehicleName, setVehicleName] = useState("쏘렌토 MQ4");
  const [fuel, setFuel] = useState("");
  const [drainCount, setDrainCount] = useState("2~3회");
  const [blackbox, setBlackbox] = useState("예");
  const [voltage, setVoltage] = useState("12.1");
  const [result, setResult] = useState<ReturnType<typeof mockDiagnosisResult> | null>(null);

  const vehicleId = useMemo(() => resolveVehicleIdFromName(vehicleName), [vehicleName]);
  const fuelOptions = useMemo(() => getFuelOptionsForVehicle(vehicleId), [vehicleId]);

  const displaySymptoms = useMemo(() => {
    const primary = PRIMARY_SYMPTOM_IDS.map((id) => symptoms.find((s) => s.id === id)).filter(Boolean);
    const rest = symptoms.filter((s) => !PRIMARY_SYMPTOM_IDS.includes(s.id as (typeof PRIMARY_SYMPTOM_IDS)[number]));
    return [...primary, ...rest] as typeof symptoms;
  }, []);

  const primarySymptoms = displaySymptoms.filter((s) =>
    PRIMARY_SYMPTOM_IDS.includes(s.id as (typeof PRIMARY_SYMPTOM_IDS)[number]),
  );

  function runDiagnosis() {
    setResult(
      mockDiagnosisResult({
        symptomId,
        vehicleName,
        drainCount,
        blackbox,
        voltage,
        fuel: fuel || undefined,
      }),
    );
    setStep(4);
  }

  const tone = result ? riskTone(result.risk) : "blue";

  return (
    <div className="scroll-mt-24 space-y-4">
      <section className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm sm:p-5">
        <p className="text-[11px] font-black uppercase tracking-wide text-blue-600">증상 확인</p>
        <h2 className="mt-1 text-xl font-black tracking-tight text-slate-900">단계별로 증상을 확인하세요</h2>
        <p className="mt-1.5 text-sm font-medium text-slate-500">
          차량 증상 → 차량 정보 → 사용 환경 순으로 입력하면 배터리 확인에 도움이 됩니다.
        </p>
        <StepHeader step={step} />
      </section>

      {step === 1 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <h3 className="text-base font-black text-slate-900">1단계 · 증상 선택</h3>
          <p className="mt-1 text-xs font-medium text-slate-500">가장 가까운 증상을 선택해 주세요.</p>
          <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {primarySymptoms.map((s) => {
              const selected = symptomId === s.id;
              const tags = [s.subtitle].filter(Boolean).slice(0, 2);
              return (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => setSymptomId(s.id)}
                  className={`flex items-start gap-3 rounded-xl p-3.5 text-left transition ${
                    selected
                      ? "bg-blue-600 text-white shadow-md ring-2 ring-blue-600"
                      : "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200 hover:ring-blue-200"
                  }`}
                >
                  <span className={selected ? "text-white" : "text-blue-600"}>
                    <SymptomIcon id={s.id} />
                  </span>
                  <span className="min-w-0">
                    <p className="text-sm font-black leading-snug">{s.title}</p>
                    {tags.map((t) => (
                      <span
                        key={t}
                        className={`mt-1 mr-1 inline-block rounded px-1.5 py-px text-[9px] font-bold ${
                          selected ? "bg-white/20 text-blue-50" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {t}
                      </span>
                    ))}
                  </span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => setStep(2)}
            className="mt-5 w-full rounded-xl bg-blue-600 py-3 text-sm font-black text-white shadow-sm hover:bg-blue-700 sm:w-auto sm:px-8"
          >
            다음: 차량 정보
          </button>
        </section>
      )}

      {step === 2 && (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <h3 className="text-base font-black text-slate-900">2단계 · 차량 정보 입력</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block text-xs font-black text-slate-500">
              차량명/연식
              <input
                className="mt-2 w-full rounded-lg bg-slate-50 px-3 py-3 text-sm font-bold ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-300"
                value={vehicleName}
                onChange={(e) => {
                  setVehicleName(e.target.value);
                  setFuel("");
                }}
              />
            </label>
            {fuelOptions.length > 1 ? (
              <label className="block text-xs font-black text-slate-500">
                연료
                <select
                  className="mt-2 w-full rounded-lg bg-slate-50 px-3 py-3 text-sm font-bold ring-1 ring-slate-200"
                  value={fuel}
                  onChange={(e) => setFuel(e.target.value)}
                >
                  <option value="">연료 미선택 (대표 규격)</option>
                  {fuelOptions.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <p className="flex items-end text-xs font-semibold text-slate-500">
                연료는 상세 페이지에서 확인할 수 있습니다.
              </p>
            )}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-black text-slate-600 hover:bg-slate-50"
            >
              이전
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-black text-white hover:bg-blue-700"
            >
              다음: 사용 환경
            </button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <h3 className="text-base font-black text-slate-900">3단계 · 사용 환경</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="block text-xs font-black text-slate-500">
              방전 횟수
              <select
                className="mt-2 w-full rounded-lg bg-slate-50 px-3 py-3 text-sm font-bold ring-1 ring-slate-200"
                value={drainCount}
                onChange={(e) => setDrainCount(e.target.value)}
              >
                {["1회", "2~3회", "4회 이상"].map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-black text-slate-500">
              블랙박스 상시전원
              <select
                className="mt-2 w-full rounded-lg bg-slate-50 px-3 py-3 text-sm font-bold ring-1 ring-slate-200"
                value={blackbox}
                onChange={(e) => setBlackbox(e.target.value)}
              >
                {["예", "아니오"].map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-black text-slate-500">
              현재 전압(V)
              <input
                className="mt-2 w-full rounded-lg bg-slate-50 px-3 py-3 text-sm font-bold ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-300"
                value={voltage}
                onChange={(e) => setVoltage(e.target.value)}
              />
            </label>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-black text-slate-600 hover:bg-slate-50"
            >
              이전
            </button>
            <button
              type="button"
              onClick={runDiagnosis}
              className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-black text-white shadow-md hover:bg-blue-700 sm:w-auto sm:min-w-[200px] sm:px-8"
            >
              진단 결과 보기
            </button>
          </div>
        </section>
      )}

      {step === 4 && result && (
        <section className="scroll-mt-28 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <h3 className="text-base font-black text-slate-900">4단계 · 결과 확인</h3>
          <p className="mt-1 text-xs font-medium text-slate-500">아래는 참고 안내이며, 현장 점검·사진 확인을 권장합니다.</p>
          <p className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold leading-relaxed text-slate-800 ring-1 ring-slate-200">
            {result.verdict}
          </p>
          <h4 className="mt-3 text-lg font-black text-slate-900">
            {result.vehicle.displayName} · {result.symptom.title}
          </h4>

          <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
            <div className={`rounded-lg p-2.5 ring-1 ${riskClass(tone)}`}>
              <p className="text-[10px] font-black opacity-70">위험도</p>
              <p className="mt-0.5 font-black">{result.risk}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-2.5 ring-1 ring-slate-200">
              <p className="text-[10px] font-black text-slate-400">점검 권장</p>
              <p className="mt-0.5 font-black text-slate-800">{result.urgency}</p>
            </div>
            <div className="rounded-lg bg-blue-50 p-2.5 ring-1 ring-blue-100">
              <p className="text-[10px] font-black text-blue-500">확인 규격</p>
              <p className="mt-0.5 font-black text-blue-700">{result.batteries.join(", ")}</p>
            </div>
          </div>

          {result.batteryRec.fuelLines.length > 0 ? (
            <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2.5 ring-1 ring-slate-200">
              <p className="text-[10px] font-black text-slate-400">연료별 참고</p>
              <ul className="mt-1 space-y-1 text-xs font-semibold text-slate-700">
                {result.batteryRec.fuelLines.map((line) => (
                  <li key={`${line.label}-${line.battery}`}>
                    {line.label}: {line.battery}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-4 space-y-2">
            <p className="text-sm font-black text-slate-900">가능성 높은 원인</p>
            {result.causes.map((c) => (
              <div
                key={c.title}
                className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5 text-sm ring-1 ring-slate-200"
              >
                <span className="font-black text-slate-800">{c.title}</span>
                <span className="font-bold text-blue-600">{c.prob}</span>
              </div>
            ))}
          </div>

          <p className="mt-4 text-sm font-black text-slate-900">추천 조치</p>
          <ul className="mt-1.5 list-inside list-disc space-y-0.5 text-sm font-semibold text-slate-600">
            {result.actions.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setResult(null);
                setStep(1);
              }}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-black text-slate-600 hover:bg-slate-50"
            >
              처음부터
            </button>
            <Link
              href="/analysis/photo"
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-black text-white hover:bg-blue-700"
            >
              사진으로 확인
            </Link>
          </div>

          <div className="mt-5">
            <SmartNextActions
              context={buildContextFromSymptom(result.symptom.id, result.vehicle.id)}
              limit={5}
            />
          </div>
        </section>
      )}
    </div>
  );
}
