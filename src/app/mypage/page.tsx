import { PageShell } from "@/components/common/PageShell";
import { MyPageClient } from "@/components/mypage/MyPageClient";

export default function MyPage() {
  return (
    <PageShell zone="auth" pageLabel="마이페이지" title="마이페이지" showSearch={false} showPageHeader={false}>
      <div className="mx-auto max-w-3xl">
        <MyPageClient />
      </div>
    </PageShell>
  );
}
