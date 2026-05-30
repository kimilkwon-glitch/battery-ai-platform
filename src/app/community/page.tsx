import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/** 레거시 /community → 고객 Q&A 허브 /qa */
export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  redirect(q ? `/qa?q=${encodeURIComponent(q)}` : "/qa");
}
