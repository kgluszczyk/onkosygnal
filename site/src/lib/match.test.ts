import { describe, it, expect } from 'vitest';
import { tokenize, matchSymptoms } from './match';
import type { SymptomPattern } from './types';
import symptomPatternsJson from '../data/symptom_patterns.json';

const patterns = symptomPatternsJson as SymptomPattern[];

describe('tokenize', () => {
  it('folds Polish diacritics to ASCII', () => {
    expect(tokenize('krew w moczu')).toEqual(['krew', 'moczu']);
    expect(tokenize('żółtaczka')).toEqual(['zoltaczka']);
    expect(tokenize('trudności w połykaniu')).toEqual(['trudnosci', 'polykaniu']);
  });

  it('drops stopwords and short tokens', () => {
    expect(tokenize('to jest w z i')).toEqual([]);
  });
});

describe('matchSymptoms', () => {
  it('matches a red-flag symptom typed in lay language', () => {
    const res = matchSymptoms('mam krew w stolcu od tygodnia', patterns);
    expect(res.length).toBeGreaterThan(0);
    expect(res[0].pattern.id).toBe('rectal-bleeding');
    expect(res[0].pattern.red_flag).toBe(true);
  });

  it('matches despite missing diacritics (zoltaczka -> żółtaczka)', () => {
    const res = matchSymptoms('zoltaczka i ciemny mocz', patterns);
    expect(res.some((r) => r.pattern.id === 'jaundice')).toBe(true);
  });

  it('routes a persistent cough to the lung pattern', () => {
    const res = matchSymptoms('kaszel od miesiaca ktory nie ustepuje', patterns);
    expect(res.some((r) => r.pattern.id === 'persistent-cough')).toBe(true);
  });

  it('returns nothing for an empty / stopword-only query', () => {
    expect(matchSymptoms('', patterns)).toEqual([]);
    expect(matchSymptoms('to jest i', patterns)).toEqual([]);
  });

  it('ranks red flags ahead of non-red-flag on score ties', () => {
    const res = matchSymptoms('zmeczenie i utrata masy ciala', patterns);
    // both fatigue (non-red-flag) and weight-loss (red-flag) can appear;
    // if scores tie, the red flag must come first.
    const ids = res.map((r) => r.pattern.id);
    if (ids.includes('persistent-fatigue') && ids.includes('unexplained-weight-loss')) {
      expect(ids.indexOf('unexplained-weight-loss')).toBeLessThan(
        ids.indexOf('persistent-fatigue')
      );
    }
    expect(res.length).toBeGreaterThan(0);
  });

  it('never returns a score above 1 (retrieval confidence, not a probability)', () => {
    for (const r of matchSymptoms('krew w moczu i guzek w piersi', patterns)) {
      expect(r.score).toBeLessThanOrEqual(1);
      expect(r.score).toBeGreaterThan(0);
    }
  });
});
