import fs from "fs";
import path from "path";
import type { Page } from "@playwright/test";
import { getScreenshotLimit, shouldSaveScreenshots, SCREENSHOTS_DIR } from "./config";

export class ScreenshotBudget {
  private count = 0;
  private readonly limit: number;
  private readonly enabled: boolean;

  constructor() {
    this.enabled = shouldSaveScreenshots();
    this.limit = getScreenshotLimit();
  }

  async capture(
    page: Page,
    scenarioId: string,
    issueType: string,
    step: number,
  ): Promise<string | undefined> {
    if (!this.enabled || this.count >= this.limit) return undefined;
    try {
      fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
      const safeIssue = issueType.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 40);
      const filename = `${scenarioId}_${safeIssue}_step${step}.png`;
      const filePath = path.join(SCREENSHOTS_DIR, filename);
      await page.screenshot({ path: filePath, fullPage: false });
      this.count++;
      return filePath;
    } catch {
      return undefined;
    }
  }

  get savedCount(): number {
    return this.count;
  }
}
