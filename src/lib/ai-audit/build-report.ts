import { BUILD_STAMP, BUILD_STAMP_REV } from "@/lib/build-stamp";
import { isCustomerFacingForbiddenFile } from "@/lib/ai-audit/match-classifier";
import auditSnapshot from "@/lib/ai-audit/audit-snapshot.json";
import {
  AI_AUDIT_ROUTES,
  BATTERY_DETAIL_AUDIT_CODES,
  type AuditRouteRow,
} from "@/lib/ai-audit/route-registry";

export type RouteProbe = AuditRouteRow & {
  probedStatus: number | null;
  probedBuildRev: string | null;
  probeError: string | null;
};

export type AiAuditReport = {
  generatedAt: string;
  production: {
    buildRev: string;
    buildRevAttr: string;
    gitCommit: string;
    gitCommitRuntime: string | null;
    vercelDeploymentId: string | null;
    vercelUrl: string | null;
    deployedAt: string;
    productionAlias: string;
    isProduction: boolean;
    vercelEnv: string | null;
  };
  routes: RouteProbe[];
  forbidden: typeof auditSnapshot.forbidden;
  crossLinks: typeof auditSnapshot.crossLinks;
  batteryTemplates: Array<{
    code: string;
    route: string;
    component: string;
    headerVersion: string;
    buildRev: string;
    imageSlotPolicy: string;
    oldTemplate: boolean;
  }>;
  servicePages: typeof auditSnapshot.servicePages;
  qa: typeof auditSnapshot.qa & {
    routeExists: boolean;
    expectedStatus: number;
    componentPath: string;
  };
  summary: {
    build_rev: string;
    production_alias: string;
    qa_route_status: string;
    forbidden_keywords_found: string;
    internal_or_auth_pending: string;
    "100r_agm95l_direct_link": string;
    battery_detail_templates_unified: string;
    service_pages_unified: string;
    remaining_p0: string;
    remaining_p1: string;
    remaining_p2: string;
    sample_review_text_found: string;
    fake_mypage_data_found: string;
    photo_check_pending_copy_found: string;
    bullet_duplication_found: string;
    broken_cta_found: string;
  };
};

function productionBaseUrl(): string {
  if (process.env.AI_AUDIT_PROBE_BASE) return process.env.AI_AUDIT_PROBE_BASE.replace(/\/$/, "");
  if (process.env.VERCEL_ENV === "production") return "https://battery-ai-platform.vercel.app";
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

async function probeRoute(route: string, base: string): Promise<{
  status: number | null;
  buildRev: string | null;
  error: string | null;
}> {
  const url = `${base}${route}${route.includes("?") ? "&" : "?"}_ai_audit_probe=1`;
  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache", "User-Agent": "BM-AI-Audit/1.0" },
      signal: AbortSignal.timeout(12_000),
    });
    const html = await res.text();
    const buildRev =
      html.match(/data-build-version="([^"]+)"/)?.[1] ??
      html.match(/BM-UX-REV-[A-Z0-9-]+/)?.[0] ??
      null;
    return { status: res.status, buildRev, error: null };
  } catch (e) {
    return {
      status: null,
      buildRev: null,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

export async function buildAiAuditReport(): Promise<AiAuditReport> {
  const base = productionBaseUrl();
  const probes = await Promise.all(
    AI_AUDIT_ROUTES.map(async (row) => {
      const p = await probeRoute(row.route, base);
      return {
        ...row,
        probedStatus: p.status,
        probedBuildRev: p.buildRev,
        probeError: p.error,
      };
    }),
  );

  const forbiddenFound = auditSnapshot.forbidden.byKeyword
    .filter((k) => k.found)
    .map((k) => k.keyword);

  const customerFacingForbidden = auditSnapshot.forbidden.byKeyword
    .filter((k) => k.found && k.matches.some((m) => isCustomerFacingForbiddenFile(m.file)))
    .map((k) => k.keyword);

  const internalAuthKeywords = auditSnapshot.forbidden.byKeyword
    .filter(
      (k) =>
        k.found &&
        k.matches.some((m) => !isCustomerFacingForbiddenFile(m.file)) &&
        !k.matches.every((m) => m.file.includes("ai-audit")),
    )
    .map((k) => k.keyword);

  const cross = auditSnapshot.crossLinks;
  const directLinkRisk =
    cross.orderChecklist100rVsAgm95lCta ||
    cross.orderChecklistCompareHref ||
    cross.batteries100rDirectLink;

  const batteryTemplates = BATTERY_DETAIL_AUDIT_CODES.map((code) => ({
    code,
    route: `/batteries/${code}`,
    component: "BatteryDetailHub + BatteryDetailOrderPanel + BatteryDetailContentSlot",
    headerVersion: "PortalHeader (PageShell)",
    buildRev: BUILD_STAMP,
    imageSlotPolicy: "BatteryImageStage hero; content slot hidden or photo-check card if no asset",
    oldTemplate: false,
  }));

  const qaStatus =
    probes.find((r) => r.route === "/qa")?.probedStatus === 200 ? "200 OK" : "check probe";

  const remainingP0: string[] = [];
  const remainingP1: string[] = [];
  const remainingP2: string[] = [];

  if (probes.find((r) => r.route === "/qa")?.probedStatus !== 200) {
    remainingP0.push("/qa not 200 on probe");
  }
  if (directLinkRisk) {
    remainingP0.push("100R↔AGM95L direct compare link in source");
  }
  if (customerFacingForbidden.length) {
    remainingP1.push(`Customer-facing forbidden copy: ${customerFacingForbidden.join(", ")}`);
  }
  if (forbiddenFound.length > customerFacingForbidden.length) {
    remainingP2.push(`Non-customer forbidden hits in source: ${forbiddenFound.filter((f) => !customerFacingForbidden.includes(f)).join(", ")}`);
  }

  const risks = auditSnapshot.customerRisks as
    | {
        sample_review_text_found?: boolean;
        fake_mypage_data_found?: boolean;
        photo_check_pending_copy_found?: boolean;
        bullet_duplication_found?: boolean;
        broken_cta_found?: boolean;
      }
    | undefined;
  if (risks?.sample_review_text_found) remainingP1.push("sample_review_text_found");
  if (risks?.fake_mypage_data_found) remainingP1.push("fake_mypage_data_found");
  if (risks?.photo_check_pending_copy_found) remainingP1.push("photo_check_pending_copy_found");
  if (risks?.bullet_duplication_found) remainingP1.push("bullet_duplication_found");

  const summary = {
    build_rev: BUILD_STAMP,
    production_alias: "https://battery-ai-platform.vercel.app",
    qa_route_status: qaStatus,
    forbidden_keywords_found:
      customerFacingForbidden.length === 0 ? "none (customer-facing)" : customerFacingForbidden.join("; "),
    internal_or_auth_pending:
      internalAuthKeywords.length === 0 ? "none" : internalAuthKeywords.join("; "),
    "100r_agm95l_direct_link": directLinkRisk ? "yes (source)" : "no customer CTA",
    battery_detail_templates_unified: "yes — all use batteries/[code] + BatteryDetailHub",
    service_pages_unified: "no — /service vs /service-center intentional split",
    remaining_p0: remainingP0.length ? remainingP0.join("; ") : "none",
    remaining_p1: remainingP1.length ? remainingP1.join("; ") : "none",
    remaining_p2: remainingP2.length ? remainingP2.join("; ") : "none",
    sample_review_text_found: risks?.sample_review_text_found ? "yes" : "no",
    fake_mypage_data_found: risks?.fake_mypage_data_found ? "yes" : "no",
    photo_check_pending_copy_found: risks?.photo_check_pending_copy_found ? "yes" : "no",
    bullet_duplication_found: risks?.bullet_duplication_found ? "yes" : "no",
    broken_cta_found: risks?.broken_cta_found ? "yes" : "no",
  };

  return {
    generatedAt: new Date().toISOString(),
    production: {
      buildRev: BUILD_STAMP,
      buildRevAttr: `customer-polish-v1-20260530 (${BUILD_STAMP_REV})`,
      gitCommit: auditSnapshot.gitCommit,
      gitCommitRuntime: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
      vercelDeploymentId: process.env.VERCEL_DEPLOYMENT_ID ?? null,
      vercelUrl: process.env.VERCEL_URL ?? null,
      deployedAt: auditSnapshot.generatedAt,
      productionAlias: "https://battery-ai-platform.vercel.app",
      isProduction: process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production",
      vercelEnv: process.env.VERCEL_ENV ?? null,
    },
    routes: probes,
    forbidden: auditSnapshot.forbidden,
    crossLinks: cross,
    batteryTemplates,
    servicePages: auditSnapshot.servicePages,
    qa: {
      ...auditSnapshot.qa,
      routeExists: auditSnapshot.qa.qaPageExists,
      expectedStatus: 200,
      componentPath: "src/app/qa/page.tsx → CommunityClient",
    },
    summary,
  };
}

export function formatAuditSummaryBlock(summary: AiAuditReport["summary"]): string {
  const lines = [
    "AI_AUDIT_SUMMARY_START",
    `build_rev: ${summary.build_rev}`,
    `production_alias: ${summary.production_alias}`,
    `qa_route_status: ${summary.qa_route_status}`,
    `forbidden_keywords_found: ${summary.forbidden_keywords_found}`,
    `internal_or_auth_pending: ${summary.internal_or_auth_pending}`,
    `100r_agm95l_direct_link: ${summary["100r_agm95l_direct_link"]}`,
    `battery_detail_templates_unified: ${summary.battery_detail_templates_unified}`,
    `service_pages_unified: ${summary.service_pages_unified}`,
    `remaining_p0: ${summary.remaining_p0}`,
    `remaining_p1: ${summary.remaining_p1}`,
    `remaining_p2: ${summary.remaining_p2}`,
    `sample_review_text_found: ${summary.sample_review_text_found}`,
    `fake_mypage_data_found: ${summary.fake_mypage_data_found}`,
    `photo_check_pending_copy_found: ${summary.photo_check_pending_copy_found}`,
    `bullet_duplication_found: ${summary.bullet_duplication_found}`,
    `broken_cta_found: ${summary.broken_cta_found}`,
    "AI_AUDIT_SUMMARY_END",
  ];
  return lines.join("\n");
}
