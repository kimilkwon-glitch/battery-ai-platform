import { BUILD_STAMP, BUILD_STAMP_REV } from "@/lib/build-stamp";
import { buildAiAuditReport, formatAuditSummaryBlock } from "@/lib/ai-audit/build-report";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function Cell({ children }: { children: React.ReactNode }) {
  return (
    <td style={{ border: "1px solid #cbd5e1", padding: "6px 8px", verticalAlign: "top" }}>
      {children}
    </td>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      style={{
        border: "1px solid #94a3b8",
        padding: "6px 8px",
        textAlign: "left",
        background: "#e2e8f0",
        fontWeight: 700,
      }}
    >
      {children}
    </th>
  );
}

export default async function AiAuditPage() {
  const report = await buildAiAuditReport();
  const summaryText = formatAuditSummaryBlock(report.summary);

  return (
    <article id="ai-production-audit" data-build-version={BUILD_STAMP}>
      <header style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 800, margin: 0 }}>
          AI Production Audit - Battery Manager
        </h1>
        <p style={{ margin: "8px 0 0", color: "#475569" }}>
          Server-rendered diagnostic page for AI / web crawlers. Public URL: /__ai-audit (not in
          customer navigation).
        </p>
      </header>

      <section aria-labelledby="prod-info">
        <h2 id="prod-info" style={{ fontSize: "16px", fontWeight: 700 }}>
          1. Current production information
        </h2>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "8px" }}>
          <tbody>
            <tr>
              <Th>build rev</Th>
              <Cell>{report.production.buildRev}</Cell>
            </tr>
            <tr>
              <Th>build rev attr</Th>
              <Cell>{BUILD_STAMP_REV} / ai-audit-v2-20260530</Cell>
            </tr>
            <tr>
              <Th>git commit (build snapshot)</Th>
              <Cell>{report.production.gitCommit}</Cell>
            </tr>
            <tr>
              <Th>git commit (runtime env)</Th>
              <Cell>{report.production.gitCommitRuntime ?? "(not on Vercel)"}</Cell>
            </tr>
            <tr>
              <Th>Vercel deployment id</Th>
              <Cell>{report.production.vercelDeploymentId ?? "(local / unknown)"}</Cell>
            </tr>
            <tr>
              <Th>Vercel URL</Th>
              <Cell>{report.production.vercelUrl ?? "(local)"}</Cell>
            </tr>
            <tr>
              <Th>snapshot generated at</Th>
              <Cell>{report.production.deployedAt}</Cell>
            </tr>
            <tr>
              <Th>page generated at</Th>
              <Cell>{report.generatedAt}</Cell>
            </tr>
            <tr>
              <Th>production alias</Th>
              <Cell>{report.production.productionAlias}</Cell>
            </tr>
            <tr>
              <Th>is production</Th>
              <Cell>{report.production.isProduction ? "true" : "false"}</Cell>
            </tr>
            <tr>
              <Th>VERCEL_ENV</Th>
              <Cell>{report.production.vercelEnv ?? "(unset)"}</Cell>
            </tr>
          </tbody>
        </table>
      </section>

      <section aria-labelledby="routes" style={{ marginTop: "28px" }}>
        <h2 id="routes" style={{ fontSize: "16px", fontWeight: 700 }}>
          2. Major route status
        </h2>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "8px", fontSize: "12px" }}>
          <thead>
            <tr>
              <Th>route</Th>
              <Th>expected</Th>
              <Th>probed HTTP</Th>
              <Th>probed build rev</Th>
              <Th>page / component</Th>
              <Th>build rev source</Th>
              <Th>header</Th>
              <Th>template</Th>
              <Th>known issue</Th>
              <Th>note</Th>
            </tr>
          </thead>
          <tbody>
            {report.routes.map((r) => (
              <tr key={r.route}>
                <Cell>{r.route}</Cell>
                <Cell>{r.expectedStatus}</Cell>
                <Cell>{r.probedStatus ?? `err: ${r.probeError}`}</Cell>
                <Cell>{r.probedBuildRev ?? "—"}</Cell>
                <Cell>
                  {r.pageFile} → {r.component}
                </Cell>
                <Cell>{r.buildRevSource}</Cell>
                <Cell>{r.headerComponent}</Cell>
                <Cell>{r.templateComponent}</Cell>
                <Cell>{r.knownIssue ? "yes" : "no"}</Cell>
                <Cell>{r.note || "—"}</Cell>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section aria-labelledby="forbidden" style={{ marginTop: "28px" }}>
        <h2 id="forbidden" style={{ fontSize: "16px", fontWeight: 700 }}>
          3. Forbidden keyword grep (source scan at build)
        </h2>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "8px", fontSize: "12px" }}>
          <thead>
            <tr>
              <Th>keyword</Th>
              <Th>found</Th>
              <Th>count</Th>
              <Th>file</Th>
              <Th>line</Th>
              <Th>surrounding text</Th>
            </tr>
          </thead>
          <tbody>
            {report.forbidden.byKeyword.flatMap((row) =>
              row.found
                ? row.matches.map((m, i) => (
                    <tr key={`${row.keyword}-${i}`}>
                      <Cell>{i === 0 ? row.keyword : ""}</Cell>
                      <Cell>{i === 0 ? "true" : ""}</Cell>
                      <Cell>{i === 0 ? String(row.matchCount) : ""}</Cell>
                      <Cell>{m.file}</Cell>
                      <Cell>{m.line}</Cell>
                      <Cell>{m.text}</Cell>
                    </tr>
                  ))
                : [
                    <tr key={row.keyword}>
                      <Cell>{row.keyword}</Cell>
                      <Cell>false</Cell>
                      <Cell>0</Cell>
                      <Cell>—</Cell>
                      <Cell>—</Cell>
                      <Cell>—</Cell>
                    </tr>,
                  ],
            )}
          </tbody>
        </table>
      </section>

      <section aria-labelledby="cross" style={{ marginTop: "28px" }}>
        <h2 id="cross" style={{ fontSize: "16px", fontWeight: 700 }}>
          4. 100R ↔ AGM95L connection check
        </h2>
        <ul style={{ margin: "8px 0 0", paddingLeft: "20px" }}>
          <li>
            /batteries/100R AGM95L direct link in components:{" "}
            <strong>{report.crossLinks.batteries100rDirectLink ? "yes" : "no"}</strong>
            {report.crossLinks.batteries100rDirectLinkFiles.length
              ? ` (${report.crossLinks.batteries100rDirectLinkFiles.join(", ")})`
              : ""}
          </li>
          <li>
            /order-checklist cross-type compare CTA:{" "}
            <strong>{report.crossLinks.orderChecklist100rVsAgm95lCta ? "yes" : "no"}</strong>
          </li>
          <li>
            /order-checklist compareHref(100R, AGM95L):{" "}
            <strong>{report.crossLinks.orderChecklistCompareHref ? "yes" : "no"}</strong>
          </li>
          <li>
            Compare pair definitions (data layer):{" "}
            <strong>
              {report.crossLinks.comparePairDefinitions.length ? "present" : "none"}
            </strong>
            {report.crossLinks.comparePairDefinitions.map((c) => (
              <span key={c.file}> — {c.file}</span>
            ))}
          </li>
          <li>
            Q&A catalog cross-pair (q-100r-vs-agm95l): filtered on 100R/AGM95L pages — catalog entry
            exists in src/lib/qna/catalog-priority.ts
          </li>
        </ul>
      </section>

      <section aria-labelledby="battery-tpl" style={{ marginTop: "28px" }}>
        <h2 id="battery-tpl" style={{ fontSize: "16px", fontWeight: 700 }}>
          5. Battery detail template unity
        </h2>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "8px", fontSize: "12px" }}>
          <thead>
            <tr>
              <Th>code</Th>
              <Th>route</Th>
              <Th>component</Th>
              <Th>header</Th>
              <Th>build rev</Th>
              <Th>image slot policy</Th>
              <Th>old template</Th>
            </tr>
          </thead>
          <tbody>
            {report.batteryTemplates.map((b) => (
              <tr key={b.code}>
                <Cell>{b.code}</Cell>
                <Cell>{b.route}</Cell>
                <Cell>{b.component}</Cell>
                <Cell>{b.headerVersion}</Cell>
                <Cell>{b.buildRev}</Cell>
                <Cell>{b.imageSlotPolicy}</Cell>
                <Cell>{b.oldTemplate ? "yes" : "no"}</Cell>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section aria-labelledby="service" style={{ marginTop: "28px" }}>
        <h2 id="service" style={{ fontSize: "16px", fontWeight: 700 }}>
          6. Service pages
        </h2>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "8px", fontSize: "12px" }}>
          <thead>
            <tr>
              <Th>route</Th>
              <Th>component</Th>
              <Th>same content</Th>
              <Th>헷리면 typo</Th>
              <Th>phone CTA</Th>
              <Th>naver CTA</Th>
              <Th>blog CTA</Th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <Cell>{report.servicePages.service.route}</Cell>
              <Cell>{report.servicePages.service.component}</Cell>
              <Cell>no</Cell>
              <Cell>{report.servicePages.service.typoHetrimyeon ? "yes" : "no"}</Cell>
              <Cell>{report.servicePages.service.phoneCta ? "yes" : "no"}</Cell>
              <Cell>{report.servicePages.service.naverCta ? "yes" : "no"}</Cell>
              <Cell>{report.servicePages.service.blogCta ? "yes" : "no"}</Cell>
            </tr>
            <tr>
              <Cell>{report.servicePages.serviceCenter.route}</Cell>
              <Cell>{report.servicePages.serviceCenter.component}</Cell>
              <Cell>no</Cell>
              <Cell>{report.servicePages.serviceCenter.typoHetrimyeon ? "yes" : "no"}</Cell>
              <Cell>{report.servicePages.serviceCenter.phoneCta ? "yes" : "no"}</Cell>
              <Cell>{report.servicePages.serviceCenter.naverCta ? "yes" : "no"}</Cell>
              <Cell>{report.servicePages.serviceCenter.blogCta ? "yes" : "no"}</Cell>
            </tr>
          </tbody>
        </table>
        <p style={{ marginTop: "8px" }}>{report.servicePages.unifyRecommendation}</p>
      </section>

      <section aria-labelledby="qa" style={{ marginTop: "28px" }}>
        <h2 id="qa" style={{ fontSize: "16px", fontWeight: 700 }}>
          7. QA page check
        </h2>
        <ul style={{ margin: "8px 0 0", paddingLeft: "20px" }}>
          <li>/qa route exists: <strong>{report.qa.routeExists ? "true" : "false"}</strong></li>
          <li>expected status: <strong>{report.qa.expectedStatus}</strong></li>
          <li>component: <strong>{report.qa.componentPath}</strong></li>
          <li>/community fallback redirect: <strong>{report.qa.communityFallbackRedirect ? "yes" : "no"}</strong></li>
          <li>HUB_QA=/qa: <strong>{report.qa.hubQaRoute ? "yes" : "no"}</strong></li>
          <li>linked from (sample): {report.qa.linkedFromFiles.slice(0, 8).join(", ")}</li>
        </ul>
      </section>

      <section aria-labelledby="summary" style={{ marginTop: "32px" }}>
        <h2 id="summary" style={{ fontSize: "16px", fontWeight: 700 }}>
          8. AI-readable summary
        </h2>
        <pre
          id="ai-audit-summary"
          style={{
            marginTop: "8px",
            padding: "12px",
            background: "#0f172a",
            color: "#e2e8f0",
            borderRadius: "8px",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            fontSize: "12px",
          }}
        >
          {summaryText}
        </pre>
      </section>
    </article>
  );
}
