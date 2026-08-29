// Canonical URLs + schema.org nodes.
//
// The audience here is as much an answer engine as a search engine: people ask an LLM
// „czy chrypka od miesiąca to coś groźnego” and get a synthesised answer. Google retired
// FAQ rich results on 7 May 2026, so FAQPage buys no SERP decoration any more — it is kept
// because it is the honest schema.org description of the page and machine readers still
// consume it. Nothing emitted here may assert a diagnosis or a personal risk figure; the
// type is MedicalWebPage (health *information*), never MedicalRiskEstimator.

/** Strip our own inline markup so a JSON-LD answer reads exactly like the rendered copy. */
export function plainText(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Absolute canonical URL for a page path.
 *
 * `site` differs per deploy (onkosygnal.pl in production, kgluszczyk.github.io for the
 * Pages preview) and `pathname` already carries Astro's `base`, so the two compose. The
 * trailing slash is forced to match Astro's directory build format — otherwise canonical
 * and the sitemap entry would disagree about the same page.
 */
export function canonicalUrl(pathname: string, site: URL | undefined): string {
  if (!site) {
    throw new Error('astro.config `site` must be set — canonical URLs cannot be absolute without it.');
  }
  const clean = pathname.replace(/\/{2,}/g, '/');
  // Route files (/robots.txt, /sitemap-index.xml) keep their exact path; pages get a slash.
  const normalized = /\.[a-z0-9]+$/i.test(clean) || clean.endsWith('/') ? clean : `${clean}/`;
  return new URL(normalized, site).href;
}

/**
 * Serialise a node for a `<script type="application/ld+json">` body. `<` is escaped so a
 * stray `</script>` inside copy can never close the block early.
 */
export function jsonLdScript(node: Record<string, unknown>): string {
  return JSON.stringify(node).replace(/</g, '\\u003c');
}

export interface MedicalWebPageInput {
  name: string;
  description: string;
  url: string;
  siteName: string;
  siteUrl: string;
}

/**
 * Default node for every page. `MedicalAudience`/`MedicalCondition` describe *what the page
 * is about*, which is what makes it quotable — they make no claim about the reader.
 */
export function medicalWebPageJsonLd(input: MedicalWebPageInput): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: input.name,
    description: input.description,
    url: input.url,
    inLanguage: 'pl',
    isPartOf: { '@type': 'WebSite', name: input.siteName, url: input.siteUrl },
    publisher: { '@type': 'Organization', name: input.siteName, url: input.siteUrl },
    audience: { '@type': 'MedicalAudience', audienceType: 'Patient', geographicArea: 'Polska' },
    about: { '@type': 'MedicalCondition', name: 'Nowotwory złośliwe', alternateName: 'Rak' },
  };
}

export interface FaqEntry {
  /** Must be a question the reader can actually see on the page. */
  question: string;
  /** Answer copy as rendered — inline markup is stripped, not paraphrased. */
  answerHtml: string;
}

/**
 * Only ever call this with Q&A that is visible on the page. Markup describing content the
 * reader cannot see is spam, regardless of whether anything still renders it as a rich result.
 */
export function faqPageJsonLd(entries: FaqEntry[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entries.map((e) => ({
      '@type': 'Question',
      name: e.question,
      acceptedAnswer: { '@type': 'Answer', text: plainText(e.answerHtml) },
    })),
  };
}
