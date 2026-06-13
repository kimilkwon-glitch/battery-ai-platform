import { Suspense } from "react";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { CustomerLoginForm } from "@/components/auth/CustomerLoginForm";
import { GuestCheckoutOptionsCard } from "@/components/auth/GuestCheckoutOptionsCard";
import { ContentAreaFallback } from "@/components/common/ContentAreaFallback";

function LoginFormWithRedirect({ redirect }: { redirect?: string }) {
  return <CustomerLoginForm redirect={redirect} />;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; action?: string }>;
}) {
  const sp = await searchParams;
  const redirect = sp.redirect?.trim() || null;

  return (
    <AuthPageLayout tagline="배터리매니저 회원 로그인" companion={<GuestCheckoutOptionsCard className="mt-4 sm:mt-5" />}>
      <Suspense fallback={<ContentAreaFallback lines={4} />}>
        <LoginFormWithRedirect redirect={redirect ?? undefined} />
      </Suspense>
    </AuthPageLayout>
  );
}
