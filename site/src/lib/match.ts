// Deterministic free-text -> symptom-pattern matcher.
//
// DESIGN NOTE (important): this is RETRIEVAL, not risk scoring. It routes a user's
// words to curated educational guidance by matching against each pattern's `pl_terms`.
// It deliberately does NOT compute a probability or an embedding-similarity number —
// per the project guardrails, absolute similarity is not a calibrated risk and must
// never be shown as one. The `score` here is a match-confidence for ranking retrieval
// results only, and is intentionally not surfaced to the user as any kind of risk.
//
// Polish handling: we fold diacritics, apply a light suffix stemmer, and allow
// prefix / bounded edit-distance matches so inflected forms and typos still route
// (e.g. "kaszlu"/"kaszlem" -> "kaszel", "zoltaczka" -> "żółtaczka"). Negation cues
// ("nie", "bez", "brak"...) drop the symptom they scope so "nie mam krwi" won't match.

import type { SymptomPattern } from './types';

// Filler that must not drive a match. NB: negation cues are deliberately NOT here.
const STOP = new Set([
  'w', 'we', 'z', 'ze', 'i', 'oraz', 'a', 'o', 'u', 'na', 'do', 'od', 'po', 'za',
  'lub', 'albo', 'przy', 'sie', 'the', 'to', 'jest', 'mam', 'mnie', 'mi',
  'moj', 'moja', 'moje', 'jak', 'ale', 'czy', 'sa', 'byl', 'byla', 'ponad', 'juz',
]);

const NEGATION = new Set(['nie', 'bez', 'brak', 'braku', 'niema', 'zaden', 'zadnych', 'zadnego']);
const NEGATION_WINDOW = 3; // a cue negates the next N content tokens

// Combining diacritical marks (U+0300–U+036F), left after NFD normalization.
const COMBINING = /[̀-ͯ]/g;

/** Fold Polish diacritics to ASCII. */
export function fold(text: string): string {
  return text
    .toLowerCase()
    .replace(/ł/g, 'l') // ł/Ł do not decompose under NFD — handle explicitly.
    .normalize('NFD')
    .replace(COMBINING, '')
    .replace(/[^a-z0-9\s]/g, ' ');
}

/** Split folded text into raw ordered tokens (len>=2), keeping negation cues. */
function rawTokens(text: string): string[] {
  return fold(text)
    .split(/\s+/)
    .filter((t) => t.length >= 2);
}

/** Light Polish suffix stemmer — strips common inflectional endings (longest first). */
const ENDINGS = [
  'ami', 'ach', 'owi', 'ymi', 'imi', 'ego', 'emu', 'om', 'em', 'ie', 'ia', 'iu',
  'ow', 'y', 'i', 'a', 'e', 'u', 'o',
];
export function stem(token: string): string {
  for (const end of ENDINGS) {
    if (token.length - end.length >= 3 && token.endsWith(end)) {
      return token.slice(0, -end.length);
    }
  }
  return token;
}

/** Meaningful, stopword-free content tokens (for term vocab & query set). */
export function tokenize(text: string): string[] {
  return rawTokens(text).filter((t) => !STOP.has(t) && !NEGATION.has(t));
}

/** Bounded Levenshtein (early-exit at max+1). */
function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let best = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      cur[j] = v;
      if (v < best) best = v;
    }
    if (best > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}

/** Do two folded tokens refer to the same word (exact / stem / prefix / typo)? */
export function tokensMatch(a: string, b: string): boolean {
  if (a === b) return true;
  const sa = stem(a);
  const sb = stem(b);
  if (sa === sb && sa.length >= 3) return true;
  const short = a.length <= b.length ? a : b;
  const long = a.length <= b.length ? b : a;
  if (short.length >= 4 && long.startsWith(short)) return true; // inflection
  if (short.length >= 5 && editDistance(a, b, 1) <= 1) return true; // typo
  return false;
}

export interface MatchResult {
  pattern: SymptomPattern;
  /** Retrieval confidence in [0,1] for ranking ONLY. Not a risk/probability. */
  score: number;
  /** The user tokens that triggered the match (for transparent "why this?" UI). */
  matchedTokens: string[];
}

const DEFAULT_THRESHOLD = 0.5;

/** Content query tokens that are NOT within the scope of a negation cue. */
function affirmedQueryTokens(query: string): string[] {
  const raw = rawTokens(query);
  const out: string[] = [];
  let negatedFor = 0;
  for (const tok of raw) {
    if (NEGATION.has(tok)) {
      negatedFor = NEGATION_WINDOW;
      continue;
    }
    if (STOP.has(tok)) continue; // stopwords don't consume the negation window
    if (negatedFor > 0) {
      negatedFor--;
      continue; // token is negated -> excluded
    }
    out.push(tok);
  }
  return out;
}

/**
 * Match a free-text query against the symptom patterns.
 * Returns patterns whose best term overlaps the (non-negated) query at or above
 * `threshold`, ranked by score (red flags win ties), capped at `limit`.
 */
export function matchSymptoms(
  query: string,
  patterns: SymptomPattern[],
  { threshold = DEFAULT_THRESHOLD, limit = 5 }: { threshold?: number; limit?: number } = {}
): MatchResult[] {
  const qTokens = affirmedQueryTokens(query);
  if (qTokens.length === 0) return [];

  const results: MatchResult[] = [];

  for (const pattern of patterns) {
    let best = 0;
    let bestMatched: string[] = [];

    for (const term of [pattern.pl_label, ...pattern.pl_terms]) {
      const tTokens = [...new Set(tokenize(term))];
      if (tTokens.length === 0) continue;
      const matched: string[] = [];
      for (const tt of tTokens) {
        const hit = qTokens.find((qt) => tokensMatch(qt, tt));
        if (hit) matched.push(hit);
      }
      const score = matched.length / tTokens.length;
      if (score > best) {
        best = score;
        bestMatched = matched;
      }
    }

    if (best >= threshold) {
      results.push({ pattern, score: best, matchedTokens: [...new Set(bestMatched)] });
    }
  }

  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return Number(b.pattern.red_flag) - Number(a.pattern.red_flag); // red flags first on ties
  });

  return results.slice(0, limit);
}
