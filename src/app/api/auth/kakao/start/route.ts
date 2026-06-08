import { NextRequest } from "next/server";
import { handleOAuthStart } from "@/lib/auth/oauth-start-route";

export async function GET(request: NextRequest) {
  return handleOAuthStart(request, "kakao");
}
