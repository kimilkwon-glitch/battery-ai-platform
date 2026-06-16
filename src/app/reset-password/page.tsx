import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { ResetPasswordClient } from "@/components/auth/ResetPasswordClient";

export default function ResetPasswordPage() {
  return (
    <AuthPageLayout tagline="새 비밀번호 설정">
      <ResetPasswordClient />
    </AuthPageLayout>
  );
}
