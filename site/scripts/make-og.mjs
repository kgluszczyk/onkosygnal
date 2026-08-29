// Renders public/og.png — the 1200x630 link-preview card.
//
// Run with `npm run og` after changing the card copy or the design tokens; the PNG is
// committed so neither the build nor CI needs a browser. Rendering it in Chromium (rather
// than hand-drawing an SVG) means the card uses the real self-hosted Fraunces / Fira Sans /
// IBM Plex Mono files and the real OKLCH tokens, so it cannot drift from the site's look.

import { chromium } from '@playwright/test';
import { mkdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const siteDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const workDir = resolve(siteDir, '.og-build');
const outFile = resolve(siteDir, 'public/og.png');

const WIDTH = 1200;
const HEIGHT = 630;

const fontCss = (pkg, file) =>
  pathToFileURL(resolve(siteDir, 'node_modules', pkg, file)).href;

const html = `<!doctype html>
<html lang="pl">
<head>
<meta charset="utf-8" />
<link rel="stylesheet" href="${fontCss('@fontsource-variable/fraunces', 'full.css')}" />
<link rel="stylesheet" href="${fontCss('@fontsource/fira-sans', 'latin-ext-500.css')}" />
<link rel="stylesheet" href="${fontCss('@fontsource/ibm-plex-mono', 'latin-ext-500.css')}" />
<style>
  /* Tokens copied from src/styles/tokens/color.css (light theme) — see the note above. */
  :root {
    --bg: oklch(0.976 0.008 90);
    --text-1: oklch(0.24 0.020 72);
    --text-2: oklch(0.44 0.018 74);
    --text-3: oklch(0.50 0.014 78);
    --border: oklch(0.90 0.012 84);
    --accent-strong: oklch(0.44 0.100 197);
    --red-flag: oklch(0.74 0.150 74);
  }
  * { margin: 0; box-sizing: border-box; }
  body {
    width: ${WIDTH}px; height: ${HEIGHT}px;
    background: var(--bg);
    color: var(--text-1);
    position: relative;
    overflow: hidden;
  }
  /* The site's own ambience: verdigris top-light, amber lamplight leaking in from the
     bottom-right. Kept faint — the card should read as calm paper, not as a gradient. */
  .light {
    position: absolute; inset: 0;
    background:
      radial-gradient(120% 80% at 50% -12%, oklch(0.60 0.06 195 / 0.13), transparent 62%),
      radial-gradient(58% 70% at 104% 106%, oklch(0.74 0.150 74 / 0.22), transparent 72%);
  }
  .card {
    position: relative;
    height: 100%;
    padding: 76px 84px;
    display: flex; flex-direction: column; justify-content: space-between;
  }
  .brand { display: flex; align-items: center; gap: 18px; }
  .lamp {
    width: 30px; height: 30px; border-radius: 999px;
    background: radial-gradient(circle at 34% 30%, oklch(0.88 0.11 84), var(--red-flag) 62%);
    box-shadow: 0 0 0 8px oklch(0.74 0.150 74 / 0.16);
  }
  .wordmark {
    font-family: 'Fraunces Variable', Georgia, serif;
    font-variation-settings: 'opsz' 28, 'wght' 560, 'SOFT' 30, 'WONK' 0;
    font-size: 36px; letter-spacing: -0.005em;
  }
  h1 {
    font-family: 'Fraunces Variable', Georgia, serif;
    font-variation-settings: 'opsz' 120, 'wght' 480, 'SOFT' 40, 'WONK' 0;
    font-size: 92px; line-height: 1.05; letter-spacing: -0.02em;
    font-weight: normal;
  }
  .lede {
    font-family: 'Fira Sans', system-ui, sans-serif;
    font-weight: 500; font-size: 31px; line-height: 1.45;
    color: var(--text-2); margin-top: 26px; white-space: nowrap;
  }
  .foot {
    display: flex; align-items: center; justify-content: space-between;
    border-top: 1px solid var(--border); padding-top: 26px;
    font-family: 'IBM Plex Mono', monospace; font-weight: 500; font-size: 21px;
  }
  .domain { color: var(--accent-strong); }
  .badge { color: var(--text-3); letter-spacing: 0.06em; text-transform: uppercase; font-size: 18px; }
</style>
</head>
<body>
  <div class="light"></div>
  <div class="card">
    <div class="brand">
      <span class="lamp"></span>
      <span class="wordmark">OnkoSygnał</span>
    </div>
    <div>
      <h1>Wiedza,<br />nie diagnoza.</h1>
      <p class="lede">Objawy alarmowe &middot; karta DiLO &middot; bezpłatne badania NFZ</p>
    </div>
    <div class="foot">
      <span class="domain">onkosygnal.pl</span>
      <span class="badge">Narzędzie edukacyjne</span>
    </div>
  </div>
</body>
</html>`;

mkdirSync(workDir, { recursive: true });
const htmlFile = resolve(workDir, 'og.html');
writeFileSync(htmlFile, html, 'utf8');

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 1 });
const page = await context.newPage();
await page.goto(pathToFileURL(htmlFile).href, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: outFile, type: 'png' });
await browser.close();
rmSync(workDir, { recursive: true, force: true });

const { size } = statSync(outFile);
// WhatsApp silently downgrades previews over ~300 kB, so keep the card comfortably under it.
console.log(`og.png written: ${WIDTH}x${HEIGHT}, ${(size / 1024).toFixed(0)} kB`);
if (size > 300 * 1024) {
  console.warn('warning: og.png is over 300 kB — some chat clients will skip the large preview.');
}
