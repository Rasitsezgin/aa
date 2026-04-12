import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium, devices } from 'playwright';

const BASE_URL = process.env.MOBILE_QA_BASE_URL || process.env.MOBILE_SMOKE_BASE_URL || 'http://localhost:3000';
const OUTPUT_DIR = path.resolve('artifacts/mobile-qa');

const DEVICE_MATRIX = [
  { name: 'iphone13', profile: devices['iPhone 13'] },
  { name: 'pixel7', profile: devices['Pixel 7'] },
  { name: 'galaxyS22', profile: devices['Galaxy S22'] },
];

const ROUTES = ['/', '/pricing', '/features'];

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

function slugRoute(route) {
  return route === '/' ? 'home' : route.replaceAll('/', '_').replace(/^_+/, '');
}

async function run() {
  await ensureDir(OUTPUT_DIR);

  const browser = await chromium.launch({ headless: true });
  const report = [];
  const failures = [];

  for (const device of DEVICE_MATRIX) {
    const context = await browser.newContext({ ...device.profile });
    const page = await context.newPage();

    for (const route of ROUTES) {
      const fullUrl = `${BASE_URL}${route}`;
      const routeSlug = slugRoute(route);
      const screenshotPath = path.join(OUTPUT_DIR, `${device.name}-${routeSlug}.png`);

      try {
        const response = await page.goto(fullUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(600);

        const overflow = await page.evaluate(() => {
          const doc = document.documentElement;
          return Math.max(0, doc.scrollWidth - window.innerWidth);
        });

        const navVisible = await page.locator('nav').first().isVisible().catch(() => false);
        const menuButtonVisible = await page
          .locator('nav button[aria-label*="Menü"], nav button[aria-expanded]')
          .first()
          .isVisible()
          .catch(() => false);
        const status = response?.status() ?? null;

        await page.screenshot({ path: screenshotPath, fullPage: false, timeout: 45000 });

        const row = { device: device.name, route, status, overflow, navVisible, menuButtonVisible, screenshotPath };
        report.push(row);

        if (!status || status >= 400) {
          failures.push(`${device.name} ${route}: HTTP ${status}`);
        }
        if (overflow > 2) {
          failures.push(`${device.name} ${route}: horizontal overflow=${overflow}px`);
        }
        if (!navVisible) {
          failures.push(`${device.name} ${route}: navigation/header not visible`);
        }
      } catch (error) {
        failures.push(`${device.name} ${route}: navigation failed -> ${String(error)}`);
      }
    }

    await context.close();
  }

  await browser.close();

  console.log('Mobile device QA summary:');
  for (const row of report) {
    console.log(`- ${row.device} ${row.route} -> status=${row.status} overflow=${row.overflow}px nav=${row.navVisible} menuButton=${row.menuButtonVisible}`);
  }

  if (failures.length > 0) {
    console.error('\nMobile device QA failed:');
    for (const fail of failures) console.error(`- ${fail}`);
    process.exit(1);
  }

  console.log('\nMobile device QA passed.');
}

run().catch((error) => {
  console.error('Mobile device QA fatal:', error);
  process.exit(1);
});
