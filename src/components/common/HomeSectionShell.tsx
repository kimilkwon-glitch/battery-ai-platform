import type { ReactNode } from "react";
import type { SectionRhythm } from "@/lib/design-tokens";
import { bm } from "@/lib/design-tokens";

const RHYTHM_CLASS: Record<SectionRhythm, string> = {
  hero: bm.sectionRhythmHero,
  catalog: bm.sectionRhythmCatalog,
  vehicle: bm.sectionRhythmVehicle,
  ev: bm.sectionRhythmEv,
  symptom: bm.sectionRhythmSymptom,
  delivery: bm.sectionRhythmDelivery,
  service: bm.sectionRhythmService,
  tools: bm.sectionRhythmTools,
  qna: bm.sectionRhythmQna,
  order: bm.sectionRhythmOrder,
};

/** 메인 섹션 배경 리듬 — 역할별 톤 분리 */
export function HomeSectionShell({
  rhythm,
  children,
  className = "",
  id,
  "data-section": dataSection,
}: {
  rhythm: SectionRhythm;
  children: ReactNode;
  className?: string;
  id?: string;
  "data-section"?: string;
}) {
  return (
    <section
      className={`${RHYTHM_CLASS[rhythm]} ${className}`}
      data-home-rhythm={rhythm}
      data-section={dataSection}
      id={id}
    >
      {children}
    </section>
  );
}
