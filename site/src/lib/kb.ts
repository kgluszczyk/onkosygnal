// Typed access to the curated knowledge base (synced from repo-root data/ into src/data/).
import sourcesJson from '../data/sources.json';
import cancerSitesJson from '../data/cancer_sites.json';
import symptomPatternsJson from '../data/symptom_patterns.json';
import diloJson from '../data/dilo.json';
import type { Source, CancerSite, SymptomPattern, DiloInfo } from './types';

export const sources = sourcesJson as Source[];
export const cancerSites = cancerSitesJson as CancerSite[];
export const symptomPatterns = symptomPatternsJson as SymptomPattern[];
export const dilo = diloJson as DiloInfo;

const siteById = new Map(cancerSites.map((c) => [c.id, c]));
const sourceById = new Map(sources.map((s) => [s.id, s]));

export function getSite(id: string): CancerSite | undefined {
  return siteById.get(id);
}

export function getSource(id: string): Source | undefined {
  return sourceById.get(id);
}

/** Sites linked to a pattern, ordered by Polish incidence (context, not risk). */
export function sitesForPattern(p: SymptomPattern): CancerSite[] {
  return p.associated_site_ids
    .map((id) => siteById.get(id))
    .filter((c): c is CancerSite => Boolean(c))
    .sort((a, b) => b.incidence.annual_new_cases_pl - a.incidence.annual_new_cases_pl);
}
