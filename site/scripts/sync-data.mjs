#!/usr/bin/env node
/**
 * sync-data — refresh the site-local copies of the canonical curated data from the
 * repo-root data/ directory into src/data/.
 *
 * READ-ONLY on ../../data (the pipeline writes there): this only COPIES out.
 * Guarded: if the source is absent (e.g. Cloudflare Pages build using the committed
 * copies), it no-ops so the build stays green. The committed src/data/*.json is the
 * build-time source of truth; this keeps it fresh in local dev.
 */
import { existsSync, mkdirSync, copyFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE = resolve(__dirname, '..');
const ROOT_DATA = resolve(SITE, '..', 'data');
const DEST = join(SITE, 'src', 'data');

const FILES = ['sources.json', 'cancer_sites.json', 'symptom_patterns.json', 'dilo.json'];

if (!existsSync(ROOT_DATA)) {
  console.log('[sync-data] ../data not found — using committed src/data copies.');
  process.exit(0);
}

mkdirSync(DEST, { recursive: true });
for (const f of FILES) {
  const src = join(ROOT_DATA, f);
  if (existsSync(src)) {
    copyFileSync(src, join(DEST, f));
    console.log(`[sync-data] ${f} synced.`);
  } else {
    console.warn(`[sync-data] WARNING — ${f} missing in ../data.`);
  }
}
