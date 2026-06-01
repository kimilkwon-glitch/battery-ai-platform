import { NextResponse } from "next/server";
import { isAdminSessionValid } from "@/lib/admin/adminSession";

export const dynamic = "force-dynamic";

export async function GET() {
  const valid = await isAdminSessionValid();
  if (!valid) {
    return NextResponse.json({ ok: false, authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ ok: true, authenticated: true });
}
