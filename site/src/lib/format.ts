const NBSP = String.fromCharCode(160); // U+00A0 non-breaking space

/** Glue Polish single-letter words (a i o u w z + że) to the next word with a non-breaking
 *  space, so they never hang at a line end. */
export function nbsp(s: string): string {
  return s.replace(/(^|[\s(„»—-])([aiouwzAIOUWZ]|że|Że) /g, `$1$2${NBSP}`);
}

/** Polish plural of "rok" by count: 2–4 (except 12–14) → "lata", otherwise → "lat". */
export function plYears(n: number): string {
  const t = n % 10;
  const h = n % 100;
  return t >= 2 && t <= 4 && !(h >= 12 && h <= 14) ? 'lata' : 'lat';
}
