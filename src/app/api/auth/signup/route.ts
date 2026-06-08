import { NextResponse } from "next/server";
import { MEMBER_AUTH_MESSAGES } from "@/lib/auth/member-auth-errors";
import { toMemberPublic } from "@/lib/auth/member-public";
import { getMemberStore } from "@/lib/auth/member-store";
import { parseVehicleInfo } from "@/lib/auth/member-profile-parse";
import {
  attachCustomerSessionCookie,
  isMemberAuthReady,
  memberServiceUnavailable,
} from "@/lib/auth/member-api-helpers";
import {
  isValidEmail,
  isValidLoginId,
  isValidPassword,
  isValidPhoneDigits,
} from "@/lib/auth/signup-validation";

export const dynamic = "force-dynamic";

type SignupBody = {
  loginId?: string;
  password?: string;
  name?: string;
  phone?: string;
  email?: string;
  zonecode?: string;
  address?: string;
  detailAddress?: string;
  vehicleInfo?: unknown;
};

export async function POST(request: Request) {
  if (!isMemberAuthReady()) {
    return memberServiceUnavailable();
  }

  let body: SignupBody;
  try {
    body = (await request.json()) as SignupBody;
  } catch {
    return NextResponse.json(
      { ok: false, message: MEMBER_AUTH_MESSAGES.invalidInput },
      { status: 400 },
    );
  }

  const loginId = String(body.loginId ?? "").trim();
  const password = String(body.password ?? "");
  const name = String(body.name ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const email = String(body.email ?? "").trim();
  const zonecode = String(body.zonecode ?? "").trim();
  const address = String(body.address ?? "").trim();
  const detailAddress = String(body.detailAddress ?? "").trim();
  const vehicleInfo = parseVehicleInfo(body.vehicleInfo);

  if (
    !isValidLoginId(loginId) ||
    !isValidPassword(password) ||
    !name ||
    !isValidPhoneDigits(phone.replace(/\D/g, "")) ||
    !isValidEmail(email) ||
    !zonecode ||
    !address ||
    !detailAddress
  ) {
    return NextResponse.json(
      { ok: false, message: MEMBER_AUTH_MESSAGES.invalidInput },
      { status: 400 },
    );
  }

  const store = await getMemberStore();

  if (await store.findMemberByLoginId(loginId)) {
    return NextResponse.json(
      { ok: false, message: MEMBER_AUTH_MESSAGES.loginIdTaken },
      { status: 409 },
    );
  }

  if (await store.findMemberByEmail(email)) {
    return NextResponse.json(
      { ok: false, message: MEMBER_AUTH_MESSAGES.emailTaken },
      { status: 409 },
    );
  }

  if (await store.findMemberByPhone(phone)) {
    return NextResponse.json(
      { ok: false, message: MEMBER_AUTH_MESSAGES.phoneTaken },
      { status: 409 },
    );
  }

  try {
    const member = await store.createCredentialsMember({
      loginId,
      password,
      name,
      phone,
      email,
      zonecode,
      address,
      detailAddress,
      vehicleInfo,
    });

    const response = NextResponse.json({
      ok: true,
      member: toMemberPublic(member),
    });
    return attachCustomerSessionCookie(response, member.id);
  } catch {
    return NextResponse.json(
      { ok: false, message: MEMBER_AUTH_MESSAGES.serviceUnavailable },
      { status: 500 },
    );
  }
}
