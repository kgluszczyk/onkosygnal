import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const OUT = process.env.SHOT_DIR || './__shots';
mkdirSync(OUT, { recursive: true });
const BASE = 'http://localhost:4373';

const browser = await chromium.launch();

async function shot(name, { theme = 'light', width = 1280, height = 900, results = false, full = false } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2 });
  await ctx.addInitScript((t) => { try { localStorage.setItem('onko-theme', t); } catch {} }, theme);
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: 'networkidle' });
  if (results) {
    await page.getByLabel(/opisz, co czujesz/i).fill('od trzech tygodni chrypka i guzek na szyi, chudnę bez powodu');
    await page.getByRole('button', { name: /sprawdź sygnały/i }).click();
    await page.waitForTimeout(600);
  }
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: full });
  await ctx.close();
  console.log('shot:', name);
}

await shot('home-light-desktop', { theme: 'light' });
await shot('home-dark-desktop', { theme: 'dark' });
await shot('home-light-mobile', { theme: 'light', width: 390, height: 844 });
await shot('results-light-desktop', { theme: 'light', results: true, height: 1100 });
await shot('results-dark-desktop', { theme: 'dark', results: true, height: 1100 });

await browser.close();
console.log('done');
