import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { FindIdClient } from "@/components/auth/FindIdClient";

export default function FindIdPage() {
  return (
    <AuthPageLayout tagline="아이디 찾기">
      <FindIdClient />
    </AuthPageLayout>
  );
}
