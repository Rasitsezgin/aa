import { chromium, devices } from 'playwright';

const BASE_URL = process.env.MOBILE_SMOKE_BASE_URL || 'http://localhost:3000';
const ROUTES = [
  '/login',
  '/dashboard',
  '/dashboard/orders',
  '/dashboard/products',
  '/checkout',
  '/dashboard/payments',
  '/dashboard/settings/profile',
  '/dashboard/notifications',
];

const IGNORE_CONSOLE_ERROR_PATTERNS = [
  /Failed to load resource/i,
  /ClientFetchError:\s*Failed to fetch/i,
  /\[PRICING\].*ECONNREFUSED/i,
  /\[PRICING\].*Ayarlar okunamadi/i,
  /prisma\.systemSettings\.findUnique/i,
];

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ ...devices['iPhone 13'] });
  const page = await context.newPage();

  const failures = [];
  const results = [];

  for (const route of ROUTES) {
    const url = `${BASE_URL}${route}`;
    const consoleErrors = [];
    const pageErrors = [];

    page.removeAllListeners('console');
    page.removeAllListeners('pageerror');

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (IGNORE_CONSOLE_ERROR_PATTERNS.some((pattern) => pattern.test(text))) {
          return;
        }
        consoleErrors.push(text);
      }
    });

    page.on('pageerror', (error) => {
      pageErrors.push(String(error));
    });

    let status = null;

    try {
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      status = response?.status() ?? null;
      await page.waitForTimeout(500);
    } catch (error) {
      failures.push(`${route}: navigation failed -> ${String(error)}`);
      continue;
    }

    results.push({ route, status, consoleErrors, pageErrors });

    if (!status || status >= 400) {
      failures.push(`${route}: HTTP status ${status}`);
    }

    if (pageErrors.length > 0) {
      failures.push(`${route}: page error -> ${pageErrors[0]}`);
    }

    if (consoleErrors.length > 0) {
      failures.push(`${route}: console error -> ${consoleErrors[0]}`);
    }
  }

  await browser.close();

  console.log('Mobile smoke results:');
  for (const result of results) {
    console.log(`- ${result.route} -> ${result.status} | consoleErrors=${result.consoleErrors.length} | pageErrors=${result.pageErrors.length}`);
  }

  if (failures.length > 0) {
    console.error('\nMobile smoke failed:');
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log('\nMobile smoke passed.');
}

run().catch((error) => {
  console.error('Mobile smoke fatal:', error);
  process.exit(1);
});
