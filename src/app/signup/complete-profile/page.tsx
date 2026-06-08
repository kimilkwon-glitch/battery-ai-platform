import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { SocialProfileCompleteForm } from "@/components/auth/SocialProfileCompleteForm";

export default async function CompleteProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const sp = await searchParams;
  const redirect = sp.redirect?.trim() || null;

  return (
    <AuthPageLayout tagline="주문을 계속하려면 연락처와 배송지를 입력해 주세요">
      <SocialProfileCompleteForm redirect={redirect} />
    </AuthPageLayout>
  );
}
