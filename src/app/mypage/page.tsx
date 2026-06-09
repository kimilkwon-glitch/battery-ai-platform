import { PageShell } from "@/components/common/PageShell";
import { MyPageClient } from "@/components/mypage/MyPageClient";

export default function MyPage() {
  return (
    <PageShell zone="auth" pageLabel="마이페이지" title="마이페이지" showSearch={false} showPageHeader={false}>
      <div className="mx-auto max-w-4xl px-1 sm:px-0">
        <MyPageClient />
      </div>
    </PageShell>
  );
}
