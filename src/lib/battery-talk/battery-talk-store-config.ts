import {
  assertOperationalStoreAvailable,
  getOperationalStoreMode,
  isOperationalDbMode,
  isOperationalJsonFallbackAllowed,
  isOperationalStoreError,
  isOperationalStoreReady,
  OperationalStoreError,
  type OperationalStoreMode,
} from "@/lib/db/operational-store-config";

export type BatteryTalkStoreMode = OperationalStoreMode;
export class BatteryTalkStoreError extends OperationalStoreError {
  constructor(
    message: string,
    code: "BATTERY_TALK_DB_UNAVAILABLE" | "BATTERY_TALK_STORE_ERROR" = "BATTERY_TALK_STORE_ERROR",
  ) {
    super(
      message,
      code === "BATTERY_TALK_DB_UNAVAILABLE" ? "OPERATIONAL_DB_UNAVAILABLE" : "OPERATIONAL_STORE_ERROR",
      "battery_talk",
    );
    this.name = "BatteryTalkStoreError";
  }
}

export const isBatteryTalkDbMode = isOperationalDbMode;
export const isBatteryTalkJsonFallbackAllowed = isOperationalJsonFallbackAllowed;
export const getBatteryTalkStoreMode = getOperationalStoreMode;
export const isBatteryTalkStoreReady = isOperationalStoreReady;

export function assertBatteryTalkStoreAvailable(): void {
  assertOperationalStoreAvailable("battery_talk");
}

export function isBatteryTalkStoreError(err: unknown): err is BatteryTalkStoreError {
  return isOperationalStoreError(err);
}
