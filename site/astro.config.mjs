// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Canonical origin. base is conditional: '/' locally + in tests, '/onkosygnal' on GitHub Pages
  // (set PUBLIC_BASE_PATH in the deploy workflow) so a project-Pages URL resolves correctly.
  site: process.env.PUBLIC_BASE_PATH ? 'https://kgluszczyk.github.io' : 'https://onkosygnal.pl',
  base: process.env.PUBLIC_BASE_PATH || '/',
  // Polish is the default (un-prefixed URLs); en can mirror under /en/ later.
  i18n: {
    defaultLocale: 'pl',
    locales: ['pl'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [react(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
