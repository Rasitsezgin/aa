import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const OUT_DIR = path.resolve(process.cwd(), 'artifacts', 'auth-smoke');

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function expectVisible(page, selector, message) {
  const el = page.locator(selector).first();
  const count = await el.count();
  if (count === 0) {
    throw new Error(message + ` (selector not found: ${selector})`);
  }
  await el.waitFor({ state: 'attached', timeout: 15000 });
}

async function expectOneVisible(page, selectors, message) {
  for (const selector of selectors) {
    try {
      await expectVisible(page, selector, message);
      return selector;
    } catch {
      // try next selector
    }
  }
  throw new Error(`${message} (alternatives: ${selectors.join(', ')})`);
}

function parseFormBody(postData) {
  if (!postData) return new URLSearchParams();
  return new URLSearchParams(postData);
}

async function submitAndCaptureAuthBody(page) {
  const captured = [];
  const handler = (req) => {
    if (req.method() === 'POST' && req.url().includes('/api/auth/')) {
      captured.push(req);
    }
  };

  page.on('request', handler);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);
  page.off('request', handler);

  for (const req of captured) {
    const body = parseFormBody(req.postData() || '');
    if (body.get('callbackUrl')) {
      return body;
    }
  }

  const urls = captured.map((req) => req.url()).join(', ') || 'none';
  throw new Error(`Admin login auth POST istegi yakalanamadi. captured=${urls}`);
}

async function run() {
  await ensureDir(OUT_DIR);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    locale: 'tr-TR',
  });

  const page = await context.newPage();

  const results = [];

  // 1) Login panel smoke
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => {
    return Boolean(
      document.querySelector('input[type="email"]') ||
        document.body?.innerText?.includes('Tekrar Hoş Geldiniz'),
    );
  }, { timeout: 20000 });
  if (!page.url().includes('/login')) {
    throw new Error(`Login route beklenirken yonlendirme alindi: ${page.url()}`);
  }
  await expectOneVisible(
    page,
    ['input[type="email"]', 'input[placeholder*="E-posta"]', 'input[placeholder*="email"]'],
    'Login email input görünmüyor',
  );
  await expectOneVisible(
    page,
    ['input[type="password"]', 'input[placeholder*="Şifre"]', 'input[placeholder*="password"]'],
    'Login password input görünmüyor',
  );
  await page.screenshot({ path: path.join(OUT_DIR, 'login-mobile.png'), fullPage: true });
  results.push('login:ok');

  // 2) Register panel smoke
  await page.goto(`${BASE_URL}/signup`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => {
    return Boolean(
      document.querySelector('input[type="email"]') ||
        document.body?.innerText?.includes('Hesabınızı Oluşturun') ||
        document.body?.innerText?.includes('Ücretsiz Denemeye Başlayın'),
    );
  }, { timeout: 20000 });
  if (!page.url().includes('/signup') && !page.url().includes('/register')) {
    throw new Error(`Register route beklenirken yonlendirme alindi: ${page.url()}`);
  }
  await expectOneVisible(
    page,
    ['input[placeholder*="Ad"]', 'input[placeholder*="ad"]'],
    'Register ad input görünmüyor',
  );
  await expectOneVisible(
    page,
    ['input[type="email"]', 'input[placeholder*="E-posta"]', 'input[placeholder*="email"]'],
    'Register email input görünmüyor',
  );
  await expectOneVisible(
    page,
    ['input[type="password"]', 'input[placeholder*="Şifre"]', 'input[placeholder*="password"]'],
    'Register password input görünmüyor',
  );
  await page.screenshot({ path: path.join(OUT_DIR, 'register-mobile.png'), fullPage: true });
  results.push('register:ok');

  // 3) Admin login callbackUrl security test: external callback must be normalized to /admin
  await page.goto(`${BASE_URL}/admin/login?callbackUrl=https://evil.com`, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });
  await page.waitForFunction(() => Boolean(document.querySelector('input[type="email"]')), { timeout: 20000 });
  if (!page.url().includes('/admin/login')) {
    throw new Error(`Admin login route beklenirken yonlendirme alindi: ${page.url()}`);
  }
  await expectOneVisible(
    page,
    ['input[type="email"]', 'input[placeholder*="admin"]', 'input[placeholder*="E-posta"]'],
    'Admin login email input görünmüyor',
  );

  await page.fill('input[type="email"]', 'admin@example.com');
  await page.fill('input[type="password"]', 'invalid-password');
  const externalBody = await submitAndCaptureAuthBody(page);
  const externalCallback = externalBody.get('callbackUrl');
  if (externalCallback !== '/admin') {
    throw new Error(`Guvenlik testi basarisiz: external callback normalize edilmedi. callbackUrl=${externalCallback}`);
  }
  results.push('admin-callback-external:ok');

  // 4) Admin login callbackUrl security test: internal admin callback should be preserved
  await page.goto(`${BASE_URL}/admin/login?callbackUrl=/admin/modules`, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });

  await page.fill('input[type="email"]', 'admin@example.com');
  await page.fill('input[type="password"]', 'invalid-password');
  const internalBody = await submitAndCaptureAuthBody(page);
  const internalCallback = internalBody.get('callbackUrl');
  if (internalCallback !== '/admin/modules') {
    throw new Error(`Guvenlik testi basarisiz: internal admin callback korunmadi. callbackUrl=${internalCallback}`);
  }
  results.push('admin-callback-internal:ok');

  await page.screenshot({ path: path.join(OUT_DIR, 'admin-login-mobile.png'), fullPage: true });

  await context.close();
  await browser.close();

  console.log('AUTH_SMOKE_RESULTS');
  for (const line of results) {
    console.log(`- ${line}`);
  }
}

run().catch(async (err) => {
  console.error('AUTH_SMOKE_FAILED', err);
  process.exitCode = 1;
});
