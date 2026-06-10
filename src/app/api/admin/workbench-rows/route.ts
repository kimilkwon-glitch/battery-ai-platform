import { NextResponse } from "next/server";
import {
  adminUnauthorizedResponse,
  verifyAdminApiRequest,
} from "@/lib/admin/adminApiAuth";
import { filterUnifiedRowsByDataScope, parseAdminOrderDataScope } from "@/lib/admin/order-data-scope";
import { loadAdminWorkbenchRows } from "@/lib/admin/data/load-workbench-rows";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  if (!(await verifyAdminApiRequest(request))) {
    return NextResponse.json(adminUnauthorizedResponse(), { status: 401 });
  }

  const scope = parseAdminOrderDataScope(new URL(request.url).searchParams.get("dataScope"));
  const bundle = await loadAdminWorkbenchRows();
  const items = filterUnifiedRowsByDataScope(bundle.rows, scope);

  return NextResponse.json({
    ok: true,
    items,
    claimContext: {
      cancelRequestOrderIds: [...bundle.claimContext.cancelRequestOrderIds],
      returnExchangeOrderIds: [...bundle.claimContext.returnExchangeOrderIds],
    },
    dbReady: bundle.dbReady,
  });
}
