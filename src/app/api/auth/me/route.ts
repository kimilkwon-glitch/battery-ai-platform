import { NextResponse } from "next/server";
import { MEMBER_AUTH_MESSAGES } from "@/lib/auth/member-auth-errors";
import {
  isMemberAuthReady,
  memberServiceUnavailable,
} from "@/lib/auth/member-api-helpers";
import { isCustomerAuthConfigured } from "@/lib/auth/member-credentials";
import { parsePreferredStoreInput } from "@/lib/auth/member-preferred-store";
import { parseVehicleInfo } from "@/lib/auth/member-profile-parse";
import { toMemberPublic } from "@/lib/auth/member-public";
import { getMemberStore } from "@/lib/auth/member-store";
import type { MemberVehicleInfo, UpdateMemberProfilePatch } from "@/lib/auth/member-types";
import { getVerifiedCustomerSessionFromRequest } from "@/lib/auth/customer-session.server";
import {
  isValidEmail,
  isValidPhoneDigits,
} from "@/lib/auth/signup-validation";
import { hookAlimtalkProfileCompleted } from "@/lib/notifications/alimtalk-hooks.server";

export const dynamic = "force-dynamic";

type PatchBody = {
  name?: string;
  phone?: string;
  email?: string;
  zonecode?: string;
  address?: string;
  detailAddress?: string;
  vehicleInfo?: MemberVehicleInfo | null;
  preferredStore?: unknown;
};

function parsePatchBody(body: unknown): UpdateMemberProfilePatch | null {
  if (!body || typeof body !== "object") return null;
  const raw = body as PatchBody;
  const patch: UpdateMemberProfilePatch = {};

  if (raw.name !== undefined) patch.name = String(raw.name);
  if (raw.phone !== undefined) patch.phone = String(raw.phone);
  if (raw.email !== undefined) patch.email = String(raw.email);
  if (raw.zonecode !== undefined) patch.zonecode = String(raw.zonecode);
  if (raw.address !== undefined) patch.address = String(raw.address);
  if (raw.detailAddress !== undefined) patch.detailAddress = String(raw.detailAddress);
  if (raw.vehicleInfo !== undefined) {
    patch.vehicleInfo = raw.vehicleInfo === null ? null : parseVehicleInfo(raw.vehicleInfo);
  }
  if (raw.preferredStore !== undefined) {
    const parsed = parsePreferredStoreInput(raw.preferredStore);
    if (parsed === "invalid") return null;
    patch.preferredStore = parsed;
  }

  return Object.keys(patch).length > 0 ? patch : null;
}

export async function GET(request: Request) {
  if (!isCustomerAuthConfigured()) {
    return NextResponse.json({ member: null });
  }

  const session = await getVerifiedCustomerSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ member: null });
  }

  try {
    const store = await getMemberStore();
    const member = await store.findMemberById(session.userId);
    if (!member) {
      return NextResponse.json({ member: null });
    }
    return NextResponse.json({ member: toMemberPublic(member) });
  } catch {
    return NextResponse.json({ member: null });
  }
}

export async function PATCH(request: Request) {
  if (!isMemberAuthReady()) {
    return memberServiceUnavailable();
  }

  const session = await getVerifiedCustomerSessionFromRequest(request);
  if (!session) {
    return NextResponse.json(
      { ok: false, message: MEMBER_AUTH_MESSAGES.loginRequired },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: MEMBER_AUTH_MESSAGES.invalidInput },
      { status: 400 },
    );
  }

  const patch = parsePatchBody(body);
  if (!patch) {
    return NextResponse.json(
      { ok: false, message: MEMBER_AUTH_MESSAGES.invalidInput },
      { status: 400 },
    );
  }

  if (patch.name !== undefined && !patch.name.trim()) {
    return NextResponse.json(
      { ok: false, message: MEMBER_AUTH_MESSAGES.invalidInput },
      { status: 400 },
    );
  }

  if (patch.phone !== undefined) {
    const digits = patch.phone.replace(/\D/g, "");
    if (!isValidPhoneDigits(digits)) {
      return NextResponse.json(
        { ok: false, message: MEMBER_AUTH_MESSAGES.invalidInput },
        { status: 400 },
      );
    }
    patch.phone = patch.phone.trim();
  }

  if (patch.email !== undefined && patch.email.trim()) {
    if (!isValidEmail(patch.email)) {
      return NextResponse.json(
        { ok: false, message: MEMBER_AUTH_MESSAGES.invalidInput },
        { status: 400 },
      );
    }
    patch.email = patch.email.trim();
  }

  const store = await getMemberStore();

  if (patch.email?.trim()) {
    if (await store.isEmailTakenByOtherMember(patch.email, session.userId)) {
      return NextResponse.json(
        { ok: false, message: MEMBER_AUTH_MESSAGES.emailTaken },
        { status: 409 },
      );
    }
  }

  if (patch.phone?.trim()) {
    if (await store.isPhoneTakenByOtherMember(patch.phone, session.userId)) {
      return NextResponse.json(
        { ok: false, message: MEMBER_AUTH_MESSAGES.phoneTaken },
        { status: 409 },
      );
    }
  }

  try {
    const before = await store.findMemberById(session.userId);
    const member = await store.updateMemberProfile(session.userId, patch);
    if (!member) {
      return NextResponse.json(
        { ok: false, message: MEMBER_AUTH_MESSAGES.profileSaveFailed },
        { status: 404 },
      );
    }
    if (before) {
      hookAlimtalkProfileCompleted(before, member);
    }
    return NextResponse.json({ ok: true, member: toMemberPublic(member) });
  } catch {
    return NextResponse.json(
      { ok: false, message: MEMBER_AUTH_MESSAGES.profileSaveFailed },
      { status: 500 },
    );
  }
}
