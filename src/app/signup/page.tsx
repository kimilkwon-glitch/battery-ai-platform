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
    <AuthPageLayout tagline="차량별 배터리 규격부터 주문 확인까지 한 번에">
      <SignupForm redirect={redirect} />
    </AuthPageLayout>
  );
}
