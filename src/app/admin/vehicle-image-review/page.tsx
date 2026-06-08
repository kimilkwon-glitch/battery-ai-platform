import { AdminShellLayout } from "@/components/admin/AdminShellLayout";

export const metadata = {
  title: "차량 이미지 검수 | Battery Manager",
  robots: { index: false, follow: false },
};

/** Vercel 서버리스 용량 제한 — 로컬 `npm run audit:vehicle-images` 사용 */
export default function AdminVehicleImageReviewPage() {
  return (
    <AdminShellLayout
      title="차량 이미지 검수 (Before / After)"
      description="Production 배포 환경에서는 비활성화되어 있습니다."
    >
      <div className="admin-panel" style={{ padding: "1.25rem", maxWidth: 640 }}>
        <p style={{ margin: 0, lineHeight: 1.6 }}>
          차량 PNG 전수 검수 UI는 서버리스 함수 용량 제한으로 Vercel Production에서는 제공하지 않습니다.
        </p>
        <p style={{ margin: "0.75rem 0 0", lineHeight: 1.6, color: "var(--muted, #666)" }}>
          로컬 개발 환경에서 <code>npm run audit:vehicle-images</code> 또는{" "}
          <code>reports/vehicle-image-audit.json</code>을 확인해 주세요.
        </p>
      </div>
    </AdminShellLayout>
  );
}
