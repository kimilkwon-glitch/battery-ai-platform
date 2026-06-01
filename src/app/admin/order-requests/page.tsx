import { Suspense } from "react";
import { AdminOrderRequestsClient } from "@/components/admin/AdminOrderRequestsClient";

type Props = {
  searchParams: Promise<{ fallback?: string }>;
};

export default async function AdminOrderRequestsPage({ searchParams }: Props) {
  const { fallback } = await searchParams;

  return (
    <Suspense fallback={<main className="p-8 text-sm text-slate-500">불러오는 중…</main>}>
      <AdminOrderRequestsClient allowLocalFallback={fallback === "local"} />
    </Suspense>
  );
}
