import { PageShell } from "@/components/common/PageShell";
import { ProfileEditForm } from "@/components/mypage/ProfileEditForm";

export default function MyPageProfilePage() {
  return (
    <PageShell
      zone="auth"
      pageLabel="회원정보 수정"
      title="회원정보 수정"
      description="이름, 연락처, 주소, 자주 이용하는 지점을 관리합니다."
      showSearch={false}
    >
      <div className="mx-auto max-w-lg">
        <div className="bm-auth-page__card p-5 sm:p-6">
          <ProfileEditForm />
        </div>
      </div>
    </PageShell>
  );
}
