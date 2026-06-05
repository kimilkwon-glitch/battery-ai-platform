import { Suspense } from "react";
import { AdminOrderRequestsClient } from "@/components/admin/AdminOrderRequestsClient";
import { loadAdminNavBadges } from "@/lib/admin/data/nav-badges";

type Props = {
  searchParams: Promise<{ fallback?: string }>;
};

export default async function AdminOrderRequestsPage({ searchParams }: Props) {
  const { fallback } = await searchParams;
  const navBadges = await loadAdminNavBadges();

  return (
    <Suspense fallback={<main className="p-8 text-sm text-slate-500">불러오는 중…</main>}>
      <AdminOrderRequestsClient
        allowLocalFallback={fallback === "local"}
        navBadges={navBadges}
      />
    </Suspense>
  );
}
