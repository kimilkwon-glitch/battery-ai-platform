"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { lookupOrderRequestApi } from "@/lib/order-request/order-request-lookup-client";
import { GUEST_ORDER_PAGE } from "@/lib/guest-order/guest-order-routes";
import type { CustomerOrderRequestLookup } from "@/types/order-request";
import { bm } from "@/lib/design-tokens";

export function GuestOrderCheckClient() {
  const searchParams = useSearchParams();
  const [requestNumber, setRequestNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const [lookup, setLookup] = useState<CustomerOrderRequestLookup | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const rn = searchParams.get("requestNumber");
    if (rn) setRequestNumber(rn);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setNotFound(false);
    setLookup(null);
    setLoading(true);
    const res = await lookupOrderRequestApi(requestNumber.trim(), phone.trim());
    setLoading(false);
    if (res.ok) {
      setLookup(res.lookup);
      return;
    }
    if (res.errors?.length) {
      setFormError(res.errors.join(" "));
      return;
    }
    setNotFound(true);
  };

  return (
    <div className="space-y-5" data-page="guest-order-check">
      <section className={`${bm.card} ${bm.cardPad}`}>
        <h1 className="text-lg font-black text-slate-950">비회원 주문 조회</h1>
        <p className="mt-2 text-sm text-slate-600">
          주문번호와 접수 시 입력한 연락처로 상태를 확인합니다.
        </p>
        <Link href={GUEST_ORDER_PAGE} className={`${bm.btnTertiary} mt-3 inline-flex text-xs`}>
          비회원 주문 요청
        </Link>
      </section>

      <form className={`${bm.card} ${bm.cardPad} space-y-4`} onSubmit={(e) => void handleSubmit(e)}>
        <input
          type="text"
          name="website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
          className="pointer-events-none absolute h-0 w-0 opacity-0"
        />
        <div>
          <Label htmlFor="check-rn">주문번호</Label>
          <Input
            id="check-rn"
            required
            value={requestNumber}
            onChange={(e) => setRequestNumber(e.target.value)}
            placeholder="BM-YYYYMMDD-0001"
          />
        </div>
        <div>
          <Label htmlFor="check-phone">연락처</Label>
          <Input
            id="check-phone"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        {formError ? <p className="text-xs text-red-600">{formError}</p> : null}
        {notFound ? (
          <p className="text-xs text-amber-700">일치하는 주문을 찾지 못했습니다.</p>
        ) : null}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "조회 중…" : "조회하기"}
        </Button>
      </form>

      {lookup ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {lookup.requestNumber}
              <Badge variant="info">{lookup.statusLabel}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-slate-600">{lookup.statusDescription}</p>
            <p className="text-xs text-slate-500">{lookup.customerGuide}</p>
            <dl className="grid gap-1 text-xs">
              <div className="flex justify-between">
                <dt className="text-slate-500">접수일</dt>
                <dd>{new Date(lookup.createdAt).toLocaleString("ko-KR")}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">고객명</dt>
                <dd>{lookup.customerNameMasked}</dd>
              </div>
              {lookup.vehicleName ? (
                <div className="flex justify-between">
                  <dt className="text-slate-500">차량</dt>
                  <dd>
                    {lookup.vehicleName}
                    {lookup.vehicleYear ? ` · ${lookup.vehicleYear}` : ""}
                  </dd>
                </div>
              ) : null}
              <div className="flex justify-between">
                <dt className="text-slate-500">배터리</dt>
                <dd>{lookup.batterySpecSummary}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">장착</dt>
                <dd>{lookup.fulfillmentLabel}</dd>
              </div>
              {lookup.storeLabel ? (
                <div className="flex justify-between">
                  <dt className="text-slate-500">지점</dt>
                  <dd>{lookup.storeLabel}</dd>
                </div>
              ) : null}
              {lookup.requestedRegion ? (
                <div className="flex justify-between">
                  <dt className="text-slate-500">출장 지역</dt>
                  <dd>
                    {lookup.requestedRegion.length > 12
                      ? `${lookup.requestedRegion.slice(0, 12)}…`
                      : lookup.requestedRegion}
                  </dd>
                </div>
              ) : null}
            </dl>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
