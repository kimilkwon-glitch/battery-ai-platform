import { PortalHeader } from "@/components/portal";
import { SiteFooter } from "@/components/common/SiteFooter";
import { AuthBrandHeader } from "@/components/auth/AuthBrandHeader";

type Props = {
  children: React.ReactNode;
  tagline?: string;
};

export function AuthPageLayout({
  children,
  tagline = "차량별 배터리 규격부터 주문 확인까지 한 번에",
}: Props) {
  return (
    <main className="bm-auth-page min-h-screen bg-[var(--bm-page-bg)]">
      <PortalHeader showSearch={false} />
      <div className="bm-auth-page__shell mx-auto w-full max-w-[28rem] px-4 py-8 sm:px-6 sm:py-12 lg:max-w-[32rem] lg:py-16">
        <AuthBrandHeader tagline={tagline} />
        <div className="bm-auth-page__card mt-6 sm:mt-8">{children}</div>
      </div>
      <SiteFooter className="mt-8 border-t border-slate-200/80" />
    </main>
  );
}
