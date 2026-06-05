import type { Metadata } from "next";
import "@/styles/admin-console.css";

export const metadata: Metadata = {
  title: "운영 콘솔 | Battery Manager",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
