/**
 * @deprecated battery-alias-map.ts 사용 — 하위 호환 re-export
 */
import { getBatteryImageSet } from "./battery-alias-map";

export {
  AGM60L_IMAGE_SET,
  AGM70L_IMAGE_SET,
  EMPTY_BATTERY_IMAGE_SET,
  getBatteryImageSet,
  hasRocketBatteryAssets,
  normalizeBatteryCode,
  ROCKET_BATTERY_FOLDERS as ROCKET_BATTERY_CODES,
  ROCKET_BATTERY_FOLDERS as ROCKET_ASSET_BATTERY_CODES,
  type BatteryImageSet,
} from "./battery-alias-map";

/** @deprecated getBatteryImageSet(code, "rocket") */
export function getRocketBatteryImageSet(code: string) {
  return getBatteryImageSet(code, "rocket");
}

/** @deprecated getBatteryImageSet(code, "rocket") */
export function rocketBatteryImageSet(code: string) {
  return getBatteryImageSet(code, "rocket");
}
