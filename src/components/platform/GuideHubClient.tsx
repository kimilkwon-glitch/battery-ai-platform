"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BatteryBrandBadges } from "@/components/BatteryBrandBadges";
import { BatteryMiniThumb } from "@/components/BatteryThumbnail";
import { ContentCoverImage } from "@/components/content/ContentCoverImage";
import {
  compareHref,
  getBattery,
  getBatteryImageSet,
  getGuide,
  getVehicleName,
  guides,
  photoHref,
  searchHref,
  vehicleHref,
} from "@/lib/platform-data";
import { resolveContentCoverImage } from "@/lib/content/getContentImage";

const GUIDE_GROUPS: { label: string; ids: string[] }[] = [
  {
    label: "기본 규격",
    ids: ["agm-vs-din", "terminal-lr", "cca-ah", "manufacture-date"],
  },
  {
    label: "차량별 주의",
    ids: ["ev-12v", "bms-register", "wrong-spec", "agm-sizes", "din-sizes"],
  },
  {
    label: "관리 팁",
    ids: ["winter-cca", "blackbox-cutoff"],
  },
];

const guideSpecCards: {
  guideIds: string[];
  title: string;
  desc: string;
}[] = [
  { guideIds: ["agm-sizes"], title: "AGM 규격", desc: "ISG 차량은 AGM 유지 권장" },
  { guideIds: ["wrong-spec", "terminal-lr"], title: "오주문·단자", desc: "L/R 방향이 다르면 장착 불가" },
  { guideIds: ["cca-ah", "manufacture-date"], title: "라벨·CCA", desc: "시동성은 CCA 수치 확인" },
];

const BATTERY_ROLE_HINTS: Record<string, string> = {
  AGM80L: "ISG/스마트충전 권장",
  DIN74L: "일반 DIN 대체",
  AGM60L: "소형 ISG·승용",
  AGM70L: "중형 ISG",
  AGM95L: "대형 ISG·SUV",
  "EV 12V": "EV 보조 12V",
  AGM92Ah: "수입차 AGM",
};

function specCardContentId(guideIds: string[]): string | undefined {
  return guideIds.find((id) => resolveContentCoverImage(id).imagePath);
}

function terminalLabel(terminal: string): string {
  if (terminal === "L") return "L단자";
  if (terminal === "R") return "R단자";
  return terminal;
}

export function GuideHubClient({ initialGuideId }: { initialGuideId?: string }) {
  const params = useSearchParams();
  const [active, setActive] = useState(initialGuideId ?? guides[0].id);

  useEffect(() => {
    const g = params.get("guide");
    if (g) setActive(g);
  }, [params]);

  const detail = getGuide(active);
  const activeCover = resolveContentCoverImage(active);

  return (
    <div className="space-y-4 lg:grid lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-5">
      <nav className="space-y-4 rounded-2xl border border-blue-100 bg-white p-3 shadow-sm">
        {GUIDE_GROUPS.map((group) => {
          const items = group.ids
            .map((id) => guides.find((g) => g.id === id))
            .filter(Boolean) as typeof guides;

          return (
            <div key={group.label}>
              <p className="mb-2 px-1 text-[10px] font-black uppercase tracking-[0.06em] text-[#94A3B8]">
                {group.label}
              </p>
              <div className="space-y-1.5">
                {items.map((g) => {
                  const isActive = active === g.id;
                  const cover = resolveContentCoverImage(g.id);
                  return (
                    <button
                      type="button"
                      key={g.id}
                      onClick={() => setActive(g.id)}
                      className={`flex w-full gap-2.5 rounded-xl p-2.5 text-left transition ${
                        isActive
                          ? "bg-[#2563EB] text-white shadow-sm"
                          : "bg-[#F8FAFC] ring-1 ring-blue-50 hover:bg-blue-50/80 hover:ring-blue-100"
                      }`}
                    >
                      {cover.imagePath || cover.imageNeeded ? (
                        <ContentCoverImage
                          contentId={g.id}
                          objectFit="cover"
                          roundedClass="rounded-lg"
                          title={g.title}
                          variant="compact"
                        />
                      ) : (
                        <span
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-sm font-black ${
                            isActive ? "bg-white/15 text-white" : "bg-white text-[#2563EB] ring-1 ring-blue-50"
                          }`}
                        >
                          {g.title.charAt(0)}
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <p className="text-xs font-black leading-snug">{g.title}</p>
                        <p className={`mt-0.5 text-[10px] font-semibold leading-snug ${isActive ? "text-blue-100" : "text-[#64748B]"}`}>
                          {g.summary}
                        </p>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <section className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          {guideSpecCards.map((card) => {
            const contentId = specCardContentId(card.guideIds);
            return (
            <div
              key={card.title}
              className="flex h-full flex-col overflow-hidden rounded-xl border border-blue-100 bg-white shadow-sm"
            >
              <div className="border-b border-blue-50 px-3 py-2.5">
                <p className="text-xs font-black text-[#0F172A]">{card.title}</p>
                <p className="mt-0.5 text-[11px] font-semibold text-[#64748B]">{card.desc}</p>
              </div>
              {contentId ? (
                <ContentCoverImage
                  contentId={contentId}
                  objectFit="contain"
                  roundedClass="rounded-none"
                  title={card.title}
                  variant="card"
                />
              ) : (
                <div className="flex aspect-video items-center justify-center bg-gradient-to-b from-[#F8FBFF] to-white p-2">
                  <p className="text-[10px] font-bold text-slate-400">실물 기준 확인</p>
                </div>
              )}
            </div>
            );
          })}
        </div>

        <article className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
          {(activeCover.imagePath || activeCover.imageNeeded) ? (
            <ContentCoverImage
              contentId={active}
              objectFit="contain"
              roundedClass="rounded-none rounded-t-2xl"
              showTitle
              title={detail.title}
              variant="hero"
            />
          ) : null}
          <div className="p-5">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)]">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.06em] text-[#2563EB]">규격 가이드</p>
              <h2 className="mt-1 text-xl font-black text-[#0F172A]">{detail.title}</h2>
              <p className="mt-1 text-xs font-semibold text-[#64748B]">{detail.summary}</p>
              <p className="mt-3 rounded-xl bg-[#F8FBFF] px-4 py-3 text-sm font-semibold leading-relaxed text-[#334155] ring-1 ring-blue-50">
                {detail.body}
              </p>
            </div>
          </div>

          {detail.batteryCodes.length > 0 ? (
            <div className="mt-5">
              <p className="text-[11px] font-black uppercase tracking-[0.06em] text-[#64748B]">브랜드별 보기</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {detail.batteryCodes.map((c) => {
                  const bat = getBattery(c);
                  const rocketImages = getBatteryImageSet(c, "rocket");
                  const soliteImages = getBatteryImageSet(c, "solite");
                  const hint = BATTERY_ROLE_HINTS[c];
                  const terminal = terminalLabel(bat.terminal);

                  return (
                    <div
                      key={c}
                      className="flex flex-col rounded-xl border border-blue-100 bg-[#F8FBFF] p-4 ring-1 ring-blue-50"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex shrink-0 gap-1">
                          {rocketImages?.main ? (
                            <BatteryMiniThumb code={c} imageSet={rocketImages} role="main" className="h-10 w-10 rounded-lg bg-white" />
                          ) : null}
                          {soliteImages?.main ? (
                            <BatteryMiniThumb
                              code={c}
                              imageSet={soliteImages}
                              role="main"
                              className="h-10 w-10 rounded-lg bg-white ring-1 ring-emerald-100"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-base font-black text-[#0F172A]">{c}</p>
                          {hint ? (
                            <p className="mt-0.5 text-[11px] font-black text-[#2563EB]">{hint}</p>
                          ) : null}
                          <p className="mt-1 text-[10px] font-bold text-[#64748B]">
                            {[bat.capacity, bat.cca, terminal].filter(Boolean).join(" · ")}
                          </p>
                        </div>
                      </div>
                      <BatteryBrandBadges code={c} className="mt-2" maxVisible={2} />
                      <Link
                        className="mt-3 inline-flex w-fit rounded-lg bg-white px-3 py-1.5 text-[10px] font-black text-[#2563EB] ring-1 ring-blue-100 transition hover:bg-blue-50"
                        href={searchHref(c)}
                      >
                        {c} 상세 보기
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="mt-5 border-t border-blue-50 pt-4">
            <p className="text-[11px] font-black uppercase tracking-[0.06em] text-[#64748B]">관련 확인</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {detail.vehicleIds.map((id) => (
                <Link
                  key={id}
                  href={vehicleHref(id)}
                  className="rounded-lg bg-[#F8FBFF] px-3 py-2 text-[11px] font-black text-[#0F172A] ring-1 ring-blue-100 transition hover:bg-blue-50 hover:ring-blue-200"
                >
                  {getVehicleName(id)}
                </Link>
              ))}
              {detail.comparePair ? (
                <Link
                  href={compareHref(...detail.comparePair)}
                  className="rounded-lg bg-[#2563EB] px-3 py-2 text-[11px] font-black text-white shadow-sm transition hover:bg-[#1D4ED8]"
                >
                  {detail.comparePair.join(" vs ")} 비교
                </Link>
              ) : null}
              {(detail.id === "wrong-spec" || detail.id === "terminal-lr" || detail.id === "manufacture-date") && (
                <Link
                  href={photoHref(detail.batteryCodes[0] ?? "AGM60L")}
                  className="rounded-lg bg-[#0F172A] px-3 py-2 text-[11px] font-black text-white transition hover:bg-slate-800"
                >
                  사진으로 규격 확인
                </Link>
              )}
            </div>
          </div>
          </div>
        </article>
      </section>
    </div>
  );
}
