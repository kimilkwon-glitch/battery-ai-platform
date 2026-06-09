import { AdminCtaLinksTable } from "@/components/admin/AdminCtaLinksTable";
import { AdminShellLayout } from "@/components/admin/AdminShellLayout";
import { buildCtaLinkAuditRows, countCtaLinkErrors } from "@/lib/admin/data/cta-links-audit";
import { storeLinks } from "@/lib/external-links";

export default function AdminCtaLinksPage() {
  const rows = buildCtaLinkAuditRows();
  const errors = countCtaLinkErrors(rows);
  const ok = rows.filter((r) => r.status === "ok").length;

  return (
    <AdminShellLayout
      title="CTA/링크 점검"
      description="메인·상세·지점 링크 연결 상태를 점검합니다."
      summary={[
        { label: "전체", value: rows.length },
        { label: "정상", value: ok, tone: "info" },
        { label: "오류/의심", value: errors, tone: errors > 0 ? "danger" : "default" },
      ]}
    >
      <p className="mb-3 text-xs text-slate-500">
        덕천점 {storeLinks.deokcheon.phone} · 학장점 {storeLinks.hakjang.phone}
      </p>
      <AdminCtaLinksTable rows={rows} />
    </AdminShellLayout>
  );
}
