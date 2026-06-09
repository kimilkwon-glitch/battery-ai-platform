import { NextResponse } from "next/server";
import { adminUnauthorizedResponse, verifyAdminApiRequest } from "@/lib/admin/adminApiAuth";
import {
  getConsultationSettings,
  updateConsultationSettings,
} from "@/lib/consultation/consultation-settings-store";
import type { ConsultationChannelSettings } from "@/lib/consultation/consultation-settings";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await verifyAdminApiRequest(request))) {
    return NextResponse.json(adminUnauthorizedResponse(), { status: 401 });
  }
  const settings = await getConsultationSettings();
  return NextResponse.json({ ok: true, settings });
}

export async function PATCH(request: Request) {
  if (!(await verifyAdminApiRequest(request))) {
    return NextResponse.json(adminUnauthorizedResponse(), { status: 401 });
  }
  let body: Partial<ConsultationChannelSettings>;
  try {
    body = (await request.json()) as Partial<ConsultationChannelSettings>;
  } catch {
    return NextResponse.json({ ok: false, message: "잘못된 요청입니다." }, { status: 400 });
  }
  const settings = await updateConsultationSettings(body);
  return NextResponse.json({ ok: true, settings });
}
