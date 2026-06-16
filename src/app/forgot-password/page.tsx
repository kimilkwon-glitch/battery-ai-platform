import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { ForgotPasswordClient } from "@/components/auth/ForgotPasswordClient";

export default function ForgotPasswordPage() {
  return (
    <AuthPageLayout tagline="비밀번호 재설정">
      <ForgotPasswordClient />
    </AuthPageLayout>
  );
}
