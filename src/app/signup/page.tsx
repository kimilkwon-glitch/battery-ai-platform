import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { SignupForm } from "@/components/auth/SignupForm";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; action?: string }>;
}) {
  const sp = await searchParams;
  const redirect = sp.redirect?.trim() || null;

  return (
    <AuthPageLayout tagline="회원가입 후 배송지·차량정보를 저장하고 빠르게 주문하세요">
      <SignupForm redirect={redirect} />
    </AuthPageLayout>
  );
}
