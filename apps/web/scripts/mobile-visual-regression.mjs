import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { chromium, devices } from 'playwright';

const BASE_URL = process.env.MOBILE_QA_BASE_URL || process.env.MOBILE_SMOKE_BASE_URL || 'http://localhost:3000';
const UPDATE_BASELINE = process.env.UPDATE_VISUAL_BASELINE === '1';
const STRICT_VISUAL = process.env.STRICT_VISUAL_REGRESSION === '1';
const ROOT = path.resolve('artifacts/mobile-visual');
const BASELINE_DIR = path.join(ROOT, 'baseline');
const CURRENT_DIR = path.join(ROOT, 'current');
const DIFF_DIR = path.join(ROOT, 'diff');

const DEVICE_MATRIX = [
  { name: 'iphone13', profile: devices['iPhone 13'] },
  { name: 'pixel7', profile: devices['Pixel 7'] },
  { name: 'galaxyS22', profile: devices['Galaxy S22'] },
];

const SCENARIOS = [
  { route: '/', state: 'default' },
  { route: '/', state: 'menu-open' },
  { route: '/pricing', state: 'default' },
];

function hashBuffer(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function slugRoute(route) {
  return route === '/' ? 'home' : route.replaceAll('/', '_').replace(/^_+/, '');
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function maybeOpenMenu(page, state) {
  if (state !== 'menu-open') return;
  const menuButton = page.locator('button[aria-label*="Menüyü aç"]').first();
  if (await menuButton.isVisible().catch(() => false)) {
    await menuButton.click();
    await page.waitForTimeout(400);
  }
}

async function stabilizePageForSnapshot(page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
        caret-color: transparent !important;
      }
    `,
  });
}

async function run() {
  await Promise.all([ensureDir(BASELINE_DIR), ensureDir(CURRENT_DIR), ensureDir(DIFF_DIR)]);

  const browser = await chromium.launch({ headless: true });
  const mismatches = [];
  const createdBaselines = [];

  for (const device of DEVICE_MATRIX) {
    const context = await browser.newContext({ ...device.profile });
    const page = await context.newPage();

    for (const scenario of SCENARIOS) {
      const routeSlug = slugRoute(scenario.route);
      const fileName = `${device.name}-${routeSlug}-${scenario.state}.png`;
      const currentPath = path.join(CURRENT_DIR, fileName);
      const baselinePath = path.join(BASELINE_DIR, fileName);
      const diffMarkerPath = path.join(DIFF_DIR, `${fileName}.txt`);

      await page.goto(`${BASE_URL}${scenario.route}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await stabilizePageForSnapshot(page);
      await page.waitForTimeout(600);
      await maybeOpenMenu(page, scenario.state);
      await page.screenshot({ path: currentPath, fullPage: true });

      const current = await fs.readFile(currentPath);

      let baseline = null;
      try {
        baseline = await fs.readFile(baselinePath);
      } catch {
        await fs.copyFile(currentPath, baselinePath);
        createdBaselines.push(fileName);
        continue;
      }

      const currentHash = hashBuffer(current);
      const baselineHash = hashBuffer(baseline);

      if (currentHash !== baselineHash) {
        if (UPDATE_BASELINE) {
          await fs.copyFile(currentPath, baselinePath);
          continue;
        }

        mismatches.push(fileName);
        await fs.writeFile(
          diffMarkerPath,
          [
            `Baseline and current differ for ${fileName}`,
            `baseline: ${baselinePath}`,
            `current: ${currentPath}`,
            `baselineHash: ${baselineHash}`,
            `currentHash: ${currentHash}`,
          ].join('\n'),
          'utf8'
        );
      }
    }

    await context.close();
  }

  await browser.close();

  if (createdBaselines.length > 0) {
    console.log('Baseline images created:');
    for (const f of createdBaselines) console.log(`- ${f}`);
  }

  if (UPDATE_BASELINE) {
    console.log('\nBaseline update mode enabled (UPDATE_VISUAL_BASELINE=1).');
  }

  if (mismatches.length > 0) {
    const header = STRICT_VISUAL
      ? '\nMobile visual regression failed:'
      : '\nMobile visual regression detected changes (non-blocking mode):';
    console.error(header);
    for (const f of mismatches) console.error(`- ${f}`);

    if (STRICT_VISUAL) {
      process.exit(1);
    }

    console.log('Set STRICT_VISUAL_REGRESSION=1 to fail CI on visual differences.');
    return;
  }

  console.log('\nMobile visual regression passed.');
}

run().catch((error) => {
  console.error('Mobile visual regression fatal:', error);
  process.exit(1);
});
