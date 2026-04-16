import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { brandWebsites } from '../src/brandWebsites.js';

const OUT_DIR = path.resolve('public/brand-previews');
const REPORT_PATH = path.join(OUT_DIR, 'report.json');
const VIEWPORT = { width: 1512, height: 982 };

async function ensureOutput() {
  await fs.mkdir(OUT_DIR, { recursive: true });
}

async function captureAll() {
  await ensureOutput();

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    locale: 'en-US',
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  });

  const report = [];
  const entries = Object.entries(brandWebsites);

  for (const [id, url] of entries) {
    const page = await context.newPage();
    const outputPath = path.join(OUT_DIR, `${id}.jpg`);

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForTimeout(3200);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: outputPath, type: 'jpeg', quality: 80, fullPage: false });
      report.push({ id, url, status: 'ok', finalUrl: page.url(), file: path.basename(outputPath) });
      console.log(`OK   ${id} -> ${url}`);
    } catch (error) {
      report.push({
        id,
        url,
        status: 'failed',
        error: error instanceof Error ? error.message : String(error),
      });
      console.log(`FAIL ${id} -> ${url}`);
    } finally {
      await page.close();
    }
  }

  await fs.writeFile(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  await browser.close();

  const ok = report.filter((item) => item.status === 'ok').length;
  const failed = report.length - ok;
  console.log(`Captured ${ok}/${report.length}. Failed: ${failed}.`);
  console.log(`Report: ${REPORT_PATH}`);
}

captureAll().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
