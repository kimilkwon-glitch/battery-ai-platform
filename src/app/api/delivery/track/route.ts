import { NextResponse } from "next/server";
import {
  deliveryCarrierName,
  isKnownDeliveryCarrierCode,
  isValidInvoiceNumber,
  normalizeInvoiceNumber,
} from "@/lib/delivery/delivery-carriers";
import { fetchSweetTrackerTracking } from "@/lib/delivery/sweettracker-fetch";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type TrackRequestBody = {
  courierCode?: string;
  invoiceNumber?: string;
};

export async function POST(request: Request) {
  let body: TrackRequestBody;
  try {
    body = (await request.json()) as TrackRequestBody;
  } catch {
    return NextResponse.json(
      { ok: false, message: "요청 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  const courierCode = String(body.courierCode ?? "").trim();
  const invoiceNumber = normalizeInvoiceNumber(String(body.invoiceNumber ?? ""));

  if (!courierCode) {
    return NextResponse.json(
      { ok: false, message: "택배사를 선택해 주세요." },
      { status: 422 },
    );
  }

  if (!isKnownDeliveryCarrierCode(courierCode)) {
    return NextResponse.json(
      { ok: false, message: "지원하지 않는 택배사 코드입니다." },
      { status: 422 },
    );
  }

  if (!invoiceNumber) {
    return NextResponse.json(
      { ok: false, message: "운송장번호를 입력해 주세요." },
      { status: 422 },
    );
  }

  if (!isValidInvoiceNumber(invoiceNumber)) {
    return NextResponse.json(
      { ok: false, message: "운송장번호 형식이 올바르지 않습니다." },
      { status: 422 },
    );
  }

  const result = await fetchSweetTrackerTracking(courierCode, invoiceNumber);

  if (!result.ok) {
    return NextResponse.json(result, { status: 200 });
  }

  return NextResponse.json({
    ...result,
    carrier: {
      code: courierCode,
      name: deliveryCarrierName(courierCode) ?? courierCode,
    },
  });
}
