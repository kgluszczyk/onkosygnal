import type { APIRoute } from 'astro';
import { canonicalUrl } from '../lib/seo';
import { url } from '../lib/url';

// Generated rather than kept in public/, because the Sitemap line must be an absolute URL and
// the origin differs per deploy. A hardcoded onkosygnal.pl line would point the Pages build at
// a sitemap on a different host.
//
// Crawlers only read /robots.txt at the origin root, so on the GitHub Pages build (served under
// /onkosygnal/) this file is decorative — that deploy is held out of the index by the noindex
// meta in Base.astro, which does reach crawlers.
export const GET: APIRoute = ({ site }) => {
  const isPreviewDeploy = import.meta.env.BASE_URL !== '/';

  const body = isPreviewDeploy
    ? [
        '# Podgląd OnkoSygnału na GitHub Pages — kanoniczna wersja żyje pod https://onkosygnal.pl',
        '# Held out of the index so the preview never competes with production.',
        'User-agent: *',
        'Disallow: /',
        '',
      ].join('\n')
    : [
        '# OnkoSygnał — edukacyjne sygnalizowanie objawów onkologicznych.',
        '# Nie jest wyrobem medycznym i nie stawia diagnozy.',
        '# Crawling and AI indexing are welcome: being findable is the point of the project.',
        'User-agent: *',
        'Allow: /',
        '',
        `Sitemap: ${canonicalUrl(url('sitemap-index.xml'), site)}`,
        '',
      ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
