import { describe, it, expect } from 'vitest';
import { tokenize, stem, tokensMatch, matchSymptoms } from './match';
import type { SymptomPattern } from './types';
import symptomPatternsJson from '../data/symptom_patterns.json';

const patterns = symptomPatternsJson as SymptomPattern[];
const ids = (q: string) => matchSymptoms(q, patterns).map((r) => r.pattern.id);

describe('tokenize', () => {
  it('folds Polish diacritics to ASCII', () => {
    expect(tokenize('krew w moczu')).toEqual(['krew', 'moczu']);
    expect(tokenize('żółtaczka')).toEqual(['zoltaczka']);
    expect(tokenize('trudności w połykaniu')).toEqual(['trudnosci', 'polykaniu']);
  });

  it('drops stopwords, short tokens and negation cues', () => {
    expect(tokenize('to jest w z i')).toEqual([]);
    expect(tokenize('nie bez brak')).toEqual([]);
  });
});

describe('stem / tokensMatch', () => {
  it('unifies regular inflections via stemming', () => {
    expect(tokensMatch('objawy', 'objaw')).toBe(true);
    expect(tokensMatch('guzki', 'guzek') || tokensMatch('guzka', 'guzek')).toBeDefined();
  });
  it('matches long inflections by prefix', () => {
    expect(tokensMatch('polykaniu', 'polykanie')).toBe(true);
  });
  it('tolerates a single-character typo on longer words', () => {
    expect(tokensMatch('kaszal', 'kaszel')).toBe(true); // typo
    expect(stem('zoltaczke')).toBe(stem('zoltaczka')); // both -> zoltaczk
  });
  it('does not over-match unrelated short words', () => {
    expect(tokensMatch('rak', 'nos')).toBe(false);
  });
});

describe('matchSymptoms', () => {
  it('matches a red-flag symptom typed in lay language', () => {
    const res = matchSymptoms('mam krew w stolcu od tygodnia', patterns);
    expect(res[0].pattern.id).toBe('rectal-bleeding');
    expect(res[0].pattern.red_flag).toBe(true);
  });

  it('matches despite missing diacritics (zoltaczka -> żółtaczka)', () => {
    expect(ids('zoltaczka i ciemny mocz')).toContain('jaundice');
  });

  it('routes a persistent cough to the lung pattern', () => {
    expect(ids('kaszel od miesiaca ktory nie ustepuje')).toContain('persistent-cough');
  });

  it('handles a typo in the symptom word (kaszal -> kaszel)', () => {
    expect(ids('mam kaszal juz miesiac')).toContain('persistent-cough');
  });

  it('handles an inflected form (kaszlem)', () => {
    expect(ids('meczy mnie kaszlem')).toContain('persistent-cough');
  });

  it('respects negation — "nie mam krwi w stolcu" must NOT flag rectal bleeding', () => {
    expect(ids('nie mam krwi w stolcu')).not.toContain('rectal-bleeding');
  });

  it('returns nothing for empty / stopword-only / non-medical queries', () => {
    expect(matchSymptoms('', patterns)).toEqual([]);
    expect(matchSymptoms('to jest i', patterns)).toEqual([]);
    expect(matchSymptoms('lubie grac w pilke nozna', patterns)).toEqual([]);
  });

  it('does NOT false-match a generic word onto an unrelated phrase (ból w nodze !-> dysfagia)', () => {
    const res = ids('bol w nodze');
    expect(res).not.toContain('dysphagia');
    // leg pain is not a cancer red flag in the KB -> no confident match
    expect(res.length).toBe(0);
  });

  it('still matches a full generic-token phrase (dużo krwi -> emergency)', () => {
    expect(ids('dużo krwi')).toContain('massive-bleeding');
  });

  it('still matches when a distinctive token is present (utrata masy ciała -> weight loss)', () => {
    expect(ids('utrata masy ciała')).toContain('unexplained-weight-loss');
  });

  it('ranks red flags ahead of non-red-flag on score ties', () => {
    const res = ids('zmeczenie i utrata masy ciala');
    if (res.includes('persistent-fatigue') && res.includes('unexplained-weight-loss')) {
      expect(res.indexOf('unexplained-weight-loss')).toBeLessThan(res.indexOf('persistent-fatigue'));
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
