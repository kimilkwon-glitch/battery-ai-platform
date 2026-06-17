import "server-only";

import { getCustomerSessionSecret } from "@/lib/auth/member-credentials";
import { getMemberStore } from "@/lib/auth/member-store";
import {
  verifyCustomerSessionToken,
  type VerifiedCustomerSession,
} from "@/lib/auth/customer-session-core";

export async function verifyCustomerSessionWithEpoch(
  token: string | undefined | null,
): Promise<VerifiedCustomerSession | null> {
  const secret = getCustomerSessionSecret();
  const session = await verifyCustomerSessionToken(token, secret);
  if (!session) return null;

  try {
    const store = await getMemberStore();
    const member = await store.findMemberById(session.userId);
    if (!member) return null;

    if (member.sessionEpoch > 0) {
      if (session.legacyFormat || session.sessionEpoch !== member.sessionEpoch) {
        return null;
      }
    }

    return session;
  } catch {
    return null;
  }
}
