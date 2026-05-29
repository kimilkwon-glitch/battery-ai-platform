import type { Metadata } from "next";
import { CartProvider } from "@/components/platform/CartContext";
import "./globals.css";

import { BuildVersionStamp } from "@/components/common/BuildVersionStamp";
import { FloatingActionDock } from "@/components/support/FloatingActionDock";
import { BRAND_NAME, BRAND_META_DESCRIPTION } from "@/lib/brand";
import { BUILD_STAMP } from "@/lib/build-stamp";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
    <html lang="ko" data-build-version={BUILD_STAMP} data-build-rev="benefits-coupon-v1-20260529" className={cn("font-sans", geist.variable)}>
      <body className="antialiased" data-build-version={BUILD_STAMP} data-build-rev="benefits-coupon-v1-20260529">
        <CartProvider>
          {children}
          <FloatingActionDock />
          <BuildVersionStamp />
        </CartProvider>
      </body>
    </html>
  );
}
