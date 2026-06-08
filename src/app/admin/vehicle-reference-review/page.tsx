import { AdminShellLayout } from "@/components/admin/AdminShellLayout";

export const metadata = {
  title: "참고 이미지 검수 (테스트 5대) | Battery Manager",
  robots: { index: false, follow: false },
};

/** Vercel 서버리스 용량 제한 — 로컬 reports JSON 사용 */
export default function AdminVehicleReferenceReviewPage() {
  return (
    <AdminShellLayout
      title="참고 이미지 · Reference 기반 생성 검수"
      description="Production 배포 환경에서는 비활성화되어 있습니다."
    >
      <div className="admin-panel" style={{ padding: "1.25rem", maxWidth: 640 }}>
        <p style={{ margin: 0, lineHeight: 1.6 }}>
          참고 이미지·Kontext 생성 검수 UI는 Vercel Production에서는 비활성화되어 있습니다.
        </p>
        <p style={{ margin: "0.75rem 0 0", lineHeight: 1.6, color: "var(--muted, #666)" }}>
          로컬에서 <code>reports/vehicle-reference-candidates-test5.json</code> 등 리포트를 생성·확인해
          주세요.
        </p>
      </div>
    </AdminShellLayout>
  );
}
