import { NextResponse } from "next/server";
import { getOAuthProviderAvailability } from "@/lib/auth/oauth-providers";

export async function GET() {
  return NextResponse.json(getOAuthProviderAvailability());
}
