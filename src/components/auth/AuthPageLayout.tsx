import { PortalHeader } from "@/components/portal";
import { SiteFooter } from "@/components/common/SiteFooter";
import { AuthBrandHeader } from "@/components/auth/AuthBrandHeader";

type Props = {
  children: React.ReactNode;
  tagline?: string;
  wide?: boolean;
  /** 로그인 카드 아래 보조 섹션 (비회원 이용 등) */
  companion?: React.ReactNode;
};

export function AuthPageLayout({
  children,
  tagline = "차량별 배터리 규격부터 주문 확인까지 한 번에",
  wide = false,
  companion,
}: Props) {
  return (
    <main className="bm-auth-page min-h-screen bg-[var(--bm-page-bg)]">
      <PortalHeader showSearch={false} />
      <div
        className={
          wide
            ? "bm-auth-page__shell bm-auth-page__shell--wide mx-auto w-full max-w-[28rem] px-4 py-8 sm:max-w-[36rem] sm:px-6 sm:py-12 lg:max-w-[40rem] lg:py-16"
            : "bm-auth-page__shell mx-auto w-full max-w-[28rem] px-4 py-8 sm:px-6 sm:py-12 lg:max-w-[32rem] lg:py-16"
        }
      >
        <AuthBrandHeader tagline={tagline} />
        <div className="bm-auth-page__card mt-6 sm:mt-8">{children}</div>
        {companion}
      </div>
      <SiteFooter className="mt-8 border-t border-slate-200/80" />
    </main>
  );
}
