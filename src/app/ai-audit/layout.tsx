import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Production Audit - Battery Manager",
  robots: { index: false, follow: false },
};

/** 고객 nav/footer 없음 — plain HTML audit surface (public URL: /__ai-audit via rewrite) */
export default function AiAuditLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      id="ai-audit-root"
      style={{
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
        fontSize: "13px",
        lineHeight: 1.5,
        color: "#0f172a",
        background: "#f8fafc",
        minHeight: "100vh",
        padding: "16px 20px 48px",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      {children}
    </div>
  );
}
