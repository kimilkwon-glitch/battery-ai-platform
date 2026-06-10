import { NextResponse } from "next/server";
import { operationalErrorResponse } from "@/lib/db/operational-api-errors";
import {
  getBatteryTalkStoreMode,
  isBatteryTalkStoreError,
} from "@/lib/battery-talk/battery-talk-store-config";

export function batteryTalkStoreStatusPayload() {
  const mode = getBatteryTalkStoreMode();
  return {
    storeMode: mode,
    storeReady: mode !== "unavailable",
    dbConnected: mode === "postgres",
  };
}

export function batteryTalkErrorResponse(err: unknown, fallbackMessage: string): NextResponse {
  if (isBatteryTalkStoreError(err) && err.code === "OPERATIONAL_DB_UNAVAILABLE") {
    return operationalErrorResponse(err, fallbackMessage, "battery_talk");
  }
  return operationalErrorResponse(err, fallbackMessage, "battery_talk");
}
