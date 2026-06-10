import "server-only";
import { ensureOperationalSchema } from "@/lib/db/ensure-operational-schema";

export async function ensureBatteryTalkSchema(): Promise<void> {
  await ensureOperationalSchema();
}
