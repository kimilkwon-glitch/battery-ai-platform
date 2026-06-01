import { Suspense } from "react";
import { AdminLoginClient } from "@/components/admin/AdminLoginClient";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<main className="p-8 text-sm text-slate-500">불러오는 중…</main>}>
      <AdminLoginClient />
    </Suspense>
  );
}
