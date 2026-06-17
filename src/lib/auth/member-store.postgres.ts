import "server-only";

import { ensureMemberSchema } from "@/lib/db/ensure-member-schema";
import { getSql } from "@/lib/db/postgres";
import { hashMemberPassword } from "@/lib/auth/member-password.server";
import {
  normalizeMemberName,
  normalizeMemberPhoneDigits,
  formatPhoneForDisplay,
} from "@/lib/auth/member-normalize";
import {
  normalizeMemberEmailForStorage,
  normalizeMemberLoginIdOrEmail,
} from "@/lib/auth/member-login-identity.server";
import { isMemberPreferredStore } from "@/lib/auth/member-preferred-store";
import { mergeVehicleInfo } from "@/lib/auth/member-profile-parse";
import type {
  CreateCredentialsMemberInput,
  MemberPreferredStore,
  MemberRecord,
  MemberVehicleInfo,
  UpdateMemberProfilePatch,
  UpsertSocialMemberInput,
} from "@/lib/auth/member-types";
import type { AuthProvider } from "@/lib/customer-profile-storage";

type MemberRow = {
  id: string;
  login_id: string | null;
  email: string | null;
  phone: string;
  name: string;
  password_hash: string | null;
  provider: string;
  provider_id: string | null;
  zonecode: string | null;
  address: string | null;
  detail_address: string | null;
  vehicle_info: MemberVehicleInfo | null;
  preferred_store: string | null;
  session_epoch: number;
  created_at: string;
  updated_at: string;
};

function newMemberId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `bm-user-${crypto.randomUUID()}`;
  }
  return `bm-user-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function rowToRecord(row: MemberRow): MemberRecord {
  return {
    id: row.id,
    loginId: row.login_id,
    email: row.email,
    phone: row.phone,
    name: row.name,
    passwordHash: row.password_hash,
    provider: row.provider as AuthProvider,
    providerId: row.provider_id,
    zonecode: row.zonecode,
    address: row.address,
    detailAddress: row.detail_address,
    vehicleInfo: row.vehicle_info,
    preferredStore: parsePreferredStoreRow(row.preferred_store),
    sessionEpoch: row.session_epoch ?? 0,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

function parsePreferredStoreRow(value: string | null): MemberPreferredStore | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return isMemberPreferredStore(trimmed) ? trimmed : null;
}

export async function findMemberById(id: string): Promise<MemberRecord | null> {
  await ensureMemberSchema();
  const sql = getSql();
  const rows = (await sql`
    SELECT * FROM members WHERE id = ${id} LIMIT 1
  `) as MemberRow[];
  const row = rows[0];
  return row ? rowToRecord(row) : null;
}

export async function findMemberByLoginId(loginId: string): Promise<MemberRecord | null> {
  await ensureMemberSchema();
  const sql = getSql();
  const rows = (await sql`
    SELECT * FROM members WHERE login_id = ${loginId.trim()} LIMIT 1
  `) as MemberRow[];
  const row = rows[0];
  return row ? rowToRecord(row) : null;
}

export async function findMemberByEmail(email: string): Promise<MemberRecord | null> {
  await ensureMemberSchema();
  const sql = getSql();
  const normalized = email.trim().toLowerCase();
  const rows = (await sql`
    SELECT * FROM members WHERE LOWER(email) = ${normalized} LIMIT 1
  `) as MemberRow[];
  const row = rows[0];
  return row ? rowToRecord(row) : null;
}

export async function findMemberByPhone(phone: string): Promise<MemberRecord | null> {
  await ensureMemberSchema();
  const sql = getSql();
  const phoneDigits = normalizeMemberPhoneDigits(phone);
  const rows = (await sql`
    SELECT * FROM members
    WHERE regexp_replace(phone, '[^0-9]', '', 'g') = ${phoneDigits}
    LIMIT 1
  `) as MemberRow[];
  const row = rows[0];
  return row ? rowToRecord(row) : null;
}

export async function findMemberByNameAndPhone(
  name: string,
  phone: string,
): Promise<MemberRecord | null> {
  await ensureMemberSchema();
  const normalizedName = normalizeMemberName(name);
  const phoneDigits = normalizeMemberPhoneDigits(phone);
  if (!normalizedName || phoneDigits.length < 10) return null;

  const sql = getSql();
  const rows = (await sql`
    SELECT * FROM members
    WHERE trim(regexp_replace(name, '\\s+', ' ', 'g')) = ${normalizedName}
      AND regexp_replace(phone, '[^0-9]', '', 'g') = ${phoneDigits}
    LIMIT 1
  `) as MemberRow[];
  const row = rows[0];
  return row ? rowToRecord(row) : null;
}

export async function findMemberByIdOrEmail(idOrEmail: string): Promise<MemberRecord | null> {
  const trimmed = normalizeMemberLoginIdOrEmail(idOrEmail);
  if (!trimmed) return null;
  if (trimmed.includes("@")) {
    return findMemberByEmail(trimmed);
  }
  return findMemberByLoginId(trimmed);
}

export async function findMemberByProvider(
  provider: Exclude<AuthProvider, "credentials">,
  providerId: string,
): Promise<MemberRecord | null> {
  await ensureMemberSchema();
  const sql = getSql();
  const rows = (await sql`
    SELECT * FROM members
    WHERE provider = ${provider} AND provider_id = ${providerId.trim()}
    LIMIT 1
  `) as MemberRow[];
  const row = rows[0];
  return row ? rowToRecord(row) : null;
}

export async function createCredentialsMember(
  input: CreateCredentialsMemberInput,
): Promise<MemberRecord> {
  await ensureMemberSchema();
  const sql = getSql();
  const id = newMemberId();
  const passwordHash = hashMemberPassword(input.password);
  const vehicleInfo = input.vehicleInfo ?? null;
  const email = normalizeMemberEmailForStorage(input.email);
  const phone = formatPhoneForDisplay(normalizeMemberPhoneDigits(input.phone));

  const rows = (await sql`
    INSERT INTO members (
      id, login_id, email, phone, name, password_hash,
      provider, provider_id, zonecode, address, detail_address, vehicle_info
    ) VALUES (
      ${id},
      ${input.loginId.trim()},
      ${email},
      ${phone},
      ${input.name.trim()},
      ${passwordHash},
      'credentials',
      NULL,
      ${input.zonecode.trim()},
      ${input.address.trim()},
      ${input.detailAddress.trim()},
      ${vehicleInfo ? JSON.stringify(vehicleInfo) : null}::jsonb
    )
    RETURNING *
  `) as MemberRow[];

  const row = rows[0];
  if (!row) throw new Error("Failed to create member");
  return rowToRecord(row);
}

/** 소셜 로그인 연동용 — provider+providerId 기준 upsert */
export async function upsertSocialMember(
  input: UpsertSocialMemberInput,
): Promise<MemberRecord> {
  await ensureMemberSchema();
  const existing = await findMemberByProvider(input.provider, input.providerId);
  if (existing) {
    const sql = getSql();
    const rows = (await sql`
      UPDATE members SET
        name = ${input.name.trim() || existing.name},
        email = COALESCE(${input.email?.trim() || null}, email),
        phone = COALESCE(${input.phone?.trim() || null}, phone),
        updated_at = NOW()
      WHERE id = ${existing.id}
      RETURNING *
    `) as MemberRow[];
    const row = rows[0];
    if (!row) return existing;
    return rowToRecord(row);
  }

  let email = input.email?.trim() || null;
  if (email) {
    const emailOwner = await findMemberByEmail(email);
    if (emailOwner && emailOwner.provider !== input.provider) {
      email = null;
    }
  }

  const sql = getSql();
  const id = newMemberId();
  const rows = (await sql`
    INSERT INTO members (
      id, login_id, email, phone, name, password_hash,
      provider, provider_id
    ) VALUES (
      ${id},
      NULL,
      ${email},
      ${input.phone?.trim() || "미입력"},
      ${input.name.trim() || "회원"},
      NULL,
      ${input.provider},
      ${input.providerId.trim()}
    )
    RETURNING *
  `) as MemberRow[];
  const row = rows[0];
  if (!row) throw new Error("Failed to create social member");
  return rowToRecord(row);
}

export async function isEmailTakenByOtherMember(
  email: string,
  excludeMemberId: string,
): Promise<boolean> {
  const owner = await findMemberByEmail(email);
  return owner != null && owner.id !== excludeMemberId;
}

export async function isPhoneTakenByOtherMember(
  phone: string,
  excludeMemberId: string,
): Promise<boolean> {
  const owner = await findMemberByPhone(phone);
  return owner != null && owner.id !== excludeMemberId;
}

/** 회원 프로필 수정 — provider/loginId/passwordHash 등은 변경하지 않음 */
export async function updateMemberProfile(
  memberId: string,
  patch: UpdateMemberProfilePatch,
): Promise<MemberRecord | null> {
  await ensureMemberSchema();
  const existing = await findMemberById(memberId);
  if (!existing) return null;

  const nextName =
    patch.name !== undefined ? patch.name.trim() || existing.name : existing.name;
  const nextPhone =
    patch.phone !== undefined ? patch.phone.trim() || existing.phone : existing.phone;
  const nextEmail =
    patch.email !== undefined
      ? patch.email.trim()
        ? patch.email.trim()
        : existing.email
      : existing.email;
  const nextZonecode =
    patch.zonecode !== undefined && patch.zonecode.trim()
      ? patch.zonecode.trim()
      : existing.zonecode;
  const nextAddress =
    patch.address !== undefined && patch.address.trim()
      ? patch.address.trim()
      : existing.address;
  const nextDetailAddress =
    patch.detailAddress !== undefined && patch.detailAddress.trim()
      ? patch.detailAddress.trim()
      : existing.detailAddress;
  const nextVehicleInfo = mergeVehicleInfo(existing.vehicleInfo, patch.vehicleInfo);
  const nextPreferredStore =
    patch.preferredStore !== undefined ? patch.preferredStore : existing.preferredStore;

  const sql = getSql();
  const rows = (await sql`
    UPDATE members SET
      name = ${nextName},
      phone = ${nextPhone},
      email = ${nextEmail},
      zonecode = ${nextZonecode},
      address = ${nextAddress},
      detail_address = ${nextDetailAddress},
      vehicle_info = ${nextVehicleInfo ? JSON.stringify(nextVehicleInfo) : null}::jsonb,
      preferred_store = ${nextPreferredStore},
      updated_at = NOW()
    WHERE id = ${memberId}
    RETURNING *
  `) as MemberRow[];

  const row = rows[0];
  return row ? rowToRecord(row) : null;
}

export async function updateMemberPasswordHash(
  memberId: string,
  passwordHash: string,
): Promise<MemberRecord | null> {
  await ensureMemberSchema();
  const sql = getSql();
  const rows = (await sql`
    UPDATE members SET
      password_hash = ${passwordHash},
      session_epoch = session_epoch + 1,
      updated_at = NOW()
    WHERE id = ${memberId}
    RETURNING *
  `) as MemberRow[];
  const row = rows[0];
  return row ? rowToRecord(row) : null;
}

export async function bumpMemberSessionEpoch(memberId: string): Promise<void> {
  await ensureMemberSchema();
  const sql = getSql();
  await sql`
    UPDATE members SET session_epoch = session_epoch + 1, updated_at = NOW()
    WHERE id = ${memberId}
  `;
}
