import { buildAdminVehicleRows } from "@/lib/admin/data/vehicles-admin";
import { buildAdminBatteryRows } from "@/lib/admin/data/batteries-admin";
import { buildMatchingAuditRows } from "@/lib/admin/data/matching-audit";
import { buildAdminAliasRows } from "@/lib/admin/data/aliases-admin";
import { buildCtaLinkAuditRows } from "@/lib/admin/data/cta-links-audit";
import { isDeprioritizedBatterySpec } from "@/lib/battery-detail/deprioritized-specs";
import type { AdminErrorReportItem } from "@/types/admin";

export function buildErrorReport(): AdminErrorReportItem[] {
  const vehicles = buildAdminVehicleRows();
  const batteries = buildAdminBatteryRows();
  const matching = buildMatchingAuditRows();
  const aliases = buildAdminAliasRows();
  const ctas = buildCtaLinkAuditRows();

  const noImageVehicles = vehicles.filter((v) => !v.hasImage);
  const noImageBatteries = batteries.filter((b) => !b.hasHeroImage);
  const noMatchVehicles = vehicles.filter((v) => !v.hasBatteryMatch && !v.salesExcluded);
  const noAliasMajor = vehicles.filter((v) => !v.hasAlias).slice(0, 30);
  const salesExcludedWithOrder = matching.filter(
    (m) => m.salesExcluded && m.hasDetailPage,
  );
  const agmConflicts = matching.filter((m) => m.agmConflict);
  const terminalConflicts = matching.filter((m) => m.terminalConflict);
  const ctaErrors = ctas.filter((c) => c.status === "missing" || c.status === "suspect");
  const duplicateAliases = aliases.filter((a) => a.duplicate);
  const unlinkedAliases = aliases.filter((a) => a.unlinked);
  const retiredSpecs = batteries.filter((b) => isDeprioritizedBatterySpec(b.specCode));
  const agm95vs100 = matching.filter(
    (m) =>
      m.connectedBattery.includes("AGM95") &&
      m.candidateBatteries.some((c) => /100R/i.test(c)),
  );

  return [
    {
      id: "no-vehicle-image",
      category: "이미지",
      severity: "high",
      label: "이미지 없는 차량",
      count: noImageVehicles.length,
      href: "/admin/assets",
      samples: noImageVehicles.slice(0, 5).map((v) => v.slug),
    },
    {
      id: "no-battery-image",
      category: "이미지",
      severity: "medium",
      label: "이미지 없는 배터리",
      count: noImageBatteries.length,
      href: "/admin/assets",
      samples: noImageBatteries.slice(0, 5).map((b) => b.specCode),
    },
    {
      id: "no-battery-match",
      category: "매칭",
      severity: "high",
      label: "배터리 매칭 없는 차량",
      count: noMatchVehicles.length,
      href: "/admin/matching",
      samples: noMatchVehicles.slice(0, 5).map((v) => v.slug),
    },
    {
      id: "no-alias",
      category: "별칭",
      severity: "medium",
      label: "alias 없는 주요 차량",
      count: noAliasMajor.length,
      href: "/admin/aliases",
      samples: noAliasMajor.slice(0, 5).map((v) => v.slug),
    },
    {
      id: "sales-excluded-order-cta",
      category: "CTA",
      severity: "high",
      label: "판매 제외인데 상세 페이지 있는 차량",
      count: salesExcludedWithOrder.length,
      href: "/admin/matching",
      samples: salesExcludedWithOrder.slice(0, 5).map((m) => m.slug),
    },
    {
      id: "agm-conflict",
      category: "매칭",
      severity: "high",
      label: "AGM/일반 충돌 의심",
      count: agmConflicts.length,
      href: "/admin/matching",
      samples: agmConflicts.slice(0, 5).map((m) => m.slug),
    },
    {
      id: "terminal-conflict",
      category: "매칭",
      severity: "high",
      label: "L/R 단자 충돌 의심",
      count: terminalConflicts.length,
      href: "/admin/matching",
      samples: terminalConflicts.slice(0, 5).map((m) => m.slug),
    },
    {
      id: "cta-errors",
      category: "CTA",
      severity: "medium",
      label: "CTA 연결 오류 가능",
      count: ctaErrors.length,
      href: "/admin/cta-links",
      samples: ctaErrors.slice(0, 5).map((c) => c.label),
    },
    {
      id: "duplicate-alias",
      category: "별칭",
      severity: "low",
      label: "중복 alias",
      count: duplicateAliases.length,
      href: "/admin/aliases",
    },
    {
      id: "unlinked-alias",
      category: "별칭",
      severity: "medium",
      label: "미연결 alias",
      count: unlinkedAliases.length,
      href: "/admin/aliases",
    },
    {
      id: "retired-spec",
      category: "배터리 DB",
      severity: "medium",
      label: "비권장/삭제 규격 잔존",
      count: retiredSpecs.length,
      href: "/admin/batteries",
      samples: retiredSpecs.slice(0, 5).map((b) => b.specCode),
    },
    {
      id: "agm95-100r",
      category: "매칭",
      severity: "high",
      label: "AGM95L ↔ 100R 카드 충돌",
      count: agm95vs100.length,
      href: "/admin/matching",
      samples: agm95vs100.slice(0, 5).map((m) => m.slug),
    },
  ];
}
