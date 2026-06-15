import "server-only";

import { timingSafeEqualUtf8 } from "@/lib/admin/adminCredentials";
import { getVerifiedCustomerSessionFromRequest } from "@/lib/auth/customer-session.server";
import { getBatteryTalkVisitorFromRequest } from "@/lib/battery-talk/battery-talk-visitor-cookie.server";
import { batteryTalkGetByIdPeek } from "@/lib/battery-talk/battery-talk-store";
import type { BatteryTalkThread } from "@/types/battery-talk";

export type BatteryTalkAccessProof = {
  visitorId?: string | null;
};

function readVisitorId(request: Request, proof: BatteryTalkAccessProof): string {
  const fromCookie = getBatteryTalkVisitorFromRequest(request);
  if (fromCookie) return fromCookie;
  return proof.visitorId?.trim() || "";
}

function visitorMatchesThread(visitorId: string, thread: BatteryTalkThread): boolean {
  const stored = thread.context.visitorId?.trim();
  if (!stored) return false;
  return timingSafeEqualUtf8(visitorId, stored);
}

export async function assertBatteryTalkThreadAccess(
  request: Request,
  threadId: string,
  proof: BatteryTalkAccessProof = {},
  options?: { allowLegacyVisitorClaim?: boolean },
): Promise<
  { ok: true; thread: BatteryTalkThread } | { ok: false; status: number; message: string }
> {
  const thread = await batteryTalkGetByIdPeek(threadId.trim());
  if (!thread) {
    return { ok: false, status: 404, message: "상담을 찾을 수 없습니다." };
  }

  const session = await getVerifiedCustomerSessionFromRequest(request);
  if (session?.userId) {
    if (thread.userId && session.userId === thread.userId) {
      return { ok: true, thread };
    }
    if (thread.userId && session.userId !== thread.userId) {
      return { ok: false, status: 403, message: "상담 정보를 확인할 수 없습니다." };
    }
  }

  const visitorId = readVisitorId(request, proof);
  if (visitorId && visitorMatchesThread(visitorId, thread)) {
    return { ok: true, thread };
  }

  if (
    options?.allowLegacyVisitorClaim &&
    visitorId &&
    !thread.context.visitorId &&
    !thread.userId
  ) {
    return { ok: true, thread };
  }

  return { ok: false, status: 403, message: "상담 정보를 확인할 수 없습니다." };
}
