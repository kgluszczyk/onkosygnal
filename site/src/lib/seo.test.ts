import { describe, it, expect } from 'vitest';
import { canonicalUrl, plainText, faqPageJsonLd, jsonLdScript, medicalWebPageJsonLd } from './seo';

const PROD = new URL('https://onkosygnal.pl');
const PAGES = new URL('https://kgluszczyk.github.io');

describe('canonicalUrl', () => {
  it('makes an absolute URL against the configured origin', () => {
    expect(canonicalUrl('/o-projekcie/', PROD)).toBe('https://onkosygnal.pl/o-projekcie/');
  });

  it('forces the trailing slash so canonical matches the sitemap entry', () => {
    expect(canonicalUrl('/o-projekcie', PROD)).toBe('https://onkosygnal.pl/o-projekcie/');
    expect(canonicalUrl('/', PROD)).toBe('https://onkosygnal.pl/');
  });

  it('keeps the base path of the GitHub Pages build', () => {
    expect(canonicalUrl('/onkosygnal/o-projekcie/', PAGES)).toBe(
      'https://kgluszczyk.github.io/onkosygnal/o-projekcie/'
    );
  });

  it('leaves file routes alone', () => {
    expect(canonicalUrl('/robots.txt', PROD)).toBe('https://onkosygnal.pl/robots.txt');
  });

  it('collapses duplicate slashes from base + path concatenation', () => {
    expect(canonicalUrl('//onkosygnal//regulamin', PAGES)).toBe(
      'https://kgluszczyk.github.io/onkosygnal/regulamin/'
    );
  });

  it('fails loudly rather than emitting a relative canonical', () => {
    expect(() => canonicalUrl('/', undefined)).toThrow(/site/);
  });
});

describe('plainText', () => {
  it('strips inline markup and collapses whitespace', () => {
    expect(plainText('<strong>Brak polskich danych.</strong>\n  Wartości <em>predykcyjne</em>.')).toBe(
      'Brak polskich danych. Wartości predykcyjne.'
    );
  });

  it('preserves Polish diacritics and typographic quotes', () => {
    expect(plainText('osobisty „procent” byłby przeniesiony')).toBe(
      'osobisty „procent” byłby przeniesiony'
    );
  });
});

describe('faqPageJsonLd', () => {
  it('mirrors the rendered answer text, markup stripped', () => {
    const node = faqPageJsonLd([
      { question: 'Czym jest OnkoSygnał?', answerHtml: 'Narzędzie <strong>edukacyjne</strong>.' },
    ]) as { mainEntity: { name: string; acceptedAnswer: { text: string } }[] };

    expect(node.mainEntity).toHaveLength(1);
    expect(node.mainEntity[0]!.name).toBe('Czym jest OnkoSygnał?');
    expect(node.mainEntity[0]!.acceptedAnswer.text).toBe('Narzędzie edukacyjne.');
  });
});

describe('jsonLdScript', () => {
  it('escapes < so copy can never close the script block early', () => {
    const out = jsonLdScript({ text: 'a </script><img> b' });
    expect(out).not.toContain('</script>');
    expect(JSON.parse(out).text).toBe('a </script><img> b');
  });
});

describe('medicalWebPageJsonLd', () => {
  const node = medicalWebPageJsonLd({
    name: 'O projekcie — OnkoSygnał',
    description: 'Metodyka i źródła.',
    url: 'https://onkosygnal.pl/o-projekcie/',
    siteName: 'OnkoSygnał',
    siteUrl: 'https://onkosygnal.pl/',
  }) as Record<string, unknown>;

  it('declares health information, not a risk calculator', () => {
    expect(node['@type']).toBe('MedicalWebPage');
    expect(JSON.stringify(node)).not.toMatch(/RiskEstimator|MedicalRiskScore/);
  });

  it('is serialisable into a <script type="application/ld+json"> body', () => {
    expect(() => JSON.parse(JSON.stringify(node))).not.toThrow();
  });
});
