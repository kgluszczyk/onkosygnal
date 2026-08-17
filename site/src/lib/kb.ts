// Typed access to the curated knowledge base (synced from repo-root data/ into src/data/).
import sourcesJson from '../data/sources.json';
import cancerSitesJson from '../data/cancer_sites.json';
import symptomPatternsJson from '../data/symptom_patterns.json';
import screeningJson from '../data/screening.json';
import diloJson from '../data/dilo.json';
import type { Source, CancerSite, SymptomPattern, ScreeningProgram, DiloInfo } from './types';

export const sources = sourcesJson as Source[];
export const cancerSites = cancerSitesJson as CancerSite[];
export const symptomPatterns = symptomPatternsJson as SymptomPattern[];
export const screening = screeningJson as ScreeningProgram[];
export const dilo = diloJson as DiloInfo;

const siteById = new Map(cancerSites.map((c) => [c.id, c]));
const sourceById = new Map(sources.map((s) => [s.id, s]));

export function getSite(id: string): CancerSite | undefined {
  return siteById.get(id);
}

export function getSource(id: string): Source | undefined {
  return sourceById.get(id);
}

/** Optional, non-stored user context to tailor (never gate away) results. */
export interface UserContext {
  sex?: 'female' | 'male';
  age?: number;
}

/**
 * Sites linked to a pattern, ordered by Polish incidence (context, not risk).
 * When the user's sex is known, sex-specific sites of the opposite sex are hidden
 * (e.g. a man is not shown prostate + a woman is not shown ovarian incidence).
 * NOTE: this only filters the incidence *context*; the pattern's "see a doctor"
 * guidance is never withheld based on sex or age.
 */
export function sitesForPattern(p: SymptomPattern, ctx: UserContext = {}): CancerSite[] {
  return p.associated_site_ids
    .map((id) => siteById.get(id))
    .filter((c): c is CancerSite => Boolean(c))
    .filter((c) => !ctx.sex || c.incidence.sex === 'all' || c.incidence.sex === ctx.sex)
    .sort((a, b) => b.incidence.annual_new_cases_pl - a.incidence.annual_new_cases_pl);
}

/** Screening programmes the user is eligible for, given sex + age. Needs both to match. */
export function screeningForUser(ctx: UserContext): ScreeningProgram[] {
  if (ctx.sex == null || ctx.age == null) return [];
  return screening.filter(
    (p) =>
      (p.sex === 'all' || p.sex === ctx.sex) &&
      ctx.age! >= p.age_min &&
      ctx.age! <= p.age_max
  );
}
