// Deterministic free-text -> symptom-pattern matcher.
//
// DESIGN NOTE (important): this is RETRIEVAL, not risk scoring. It routes a user's
// words to curated educational guidance by matching against each pattern's `pl_terms`.
// It deliberately does NOT compute a probability or an embedding-similarity number —
// per the project guardrails, absolute similarity is not a calibrated risk and must
// never be shown as one. The `score` here is a match-confidence for ranking retrieval
// results only, and is intentionally not surfaced to the user as any kind of risk.

import type { SymptomPattern } from './types';

// Polish stopwords / filler that must not drive a match.
const STOP = new Set([
  'w', 'we', 'z', 'ze', 'i', 'oraz', 'a', 'o', 'u', 'na', 'do', 'od', 'po', 'za',
  'lub', 'albo', 'bez', 'przy', 'sie', 'the', 'to', 'jest', 'mam', 'mnie', 'mi',
  'moj', 'moja', 'moje', 'jak', 'ale', 'czy', 'sa', 'byl', 'byla', 'ponad', 'juz',
]);

// Combining diacritical marks (U+0300–U+036F), left after NFD normalization.
const COMBINING = /[̀-ͯ]/g;

/** Fold Polish diacritics to ASCII and tokenize into meaningful terms. */
export function tokenize(text: string): string[] {
  const folded = text
    .toLowerCase()
    // ł/Ł do not decompose under NFD — handle explicitly.
    .replace(/ł/g, 'l')
    .normalize('NFD')
    .replace(COMBINING, '') // strip a-ogonek, c-acute, n-acute, etc.
    .replace(/[^a-z0-9\s]/g, ' ');
  return folded
    .split(/\s+/)
    .filter((t) => t.length >= 2 && !STOP.has(t));
}

export interface MatchResult {
  pattern: SymptomPattern;
  /** Retrieval confidence in [0,1] for ranking ONLY. Not a risk/probability. */
  score: number;
  /** The user tokens that triggered the match (for transparent "why this?" UI). */
  matchedTokens: string[];
}

const DEFAULT_THRESHOLD = 0.5;

/**
 * Match a free-text query against the symptom patterns.
 * Returns patterns whose best term overlaps the query at or above `threshold`,
 * ranked by score (red flags win ties), capped at `limit`.
 */
export function matchSymptoms(
  query: string,
  patterns: SymptomPattern[],
  { threshold = DEFAULT_THRESHOLD, limit = 5 }: { threshold?: number; limit?: number } = {}
): MatchResult[] {
  const qTokens = new Set(tokenize(query));
  if (qTokens.size === 0) return [];

  const results: MatchResult[] = [];

  for (const pattern of patterns) {
    let best = 0;
    let bestMatched: string[] = [];

    for (const term of [pattern.pl_label, ...pattern.pl_terms]) {
      const tTokens = [...new Set(tokenize(term))];
      if (tTokens.length === 0) continue;
      const matched = tTokens.filter((t) => qTokens.has(t));
      const score = matched.length / tTokens.length;
      if (score > best) {
        best = score;
        bestMatched = matched;
      }
    }

    if (best >= threshold) {
      results.push({ pattern, score: best, matchedTokens: bestMatched });
    }
  }

  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    // tie-break: red flags first
    return Number(b.pattern.red_flag) - Number(a.pattern.red_flag);
  });

  return results.slice(0, limit);
}
