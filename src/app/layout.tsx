import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import { CartProvider } from "@/components/platform/CartContext";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  variable: "--font-noto-sans-kr",
  weight: ["400", "500", "600", "700", "800", "900"],
});

import { BuildVersionStamp } from "@/components/common/BuildVersionStamp";
import { BRAND_NAME, BRAND_META_DESCRIPTION } from "@/lib/brand";
import { BUILD_STAMP } from "@/lib/build-stamp";

export const metadata: Metadata = {
  title: `${BRAND_NAME} | 차량별 배터리 규격 검색`,
  description: BRAND_META_DESCRIPTION,
};

/** 전 route 동일 build stamp — ISR/정적 HTML에 구버전 stamp 잔류 방지 */
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" data-build-version={BUILD_STAMP}>
      <body className={`${notoSansKr.variable} antialiased`} data-build-version={BUILD_STAMP}>
        <CartProvider>
          {children}
          <BuildVersionStamp />
        </CartProvider>
      </body>
    </html>
  );
}
