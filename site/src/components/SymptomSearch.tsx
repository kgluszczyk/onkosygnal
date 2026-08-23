import { useMemo, useRef, useState, type ReactNode } from 'react';
import { matchSymptoms, tokenize, stem, type MatchResult } from '../lib/match';
import { symptomPatterns, sitesForPattern, dilo, type UserContext } from '../lib/kb';
import { ui } from '../i18n/ui';
import { Lamp, Receipt } from './ui';
import { ScreeningPanel } from './ScreeningPanel';
import { DoctorSummary } from './DoctorSummary';

const t = ui.search;
const numberPl = (n: number) => n.toLocaleString('pl-PL');

// Every stemmed token across all pattern vocab — drives the live "caring-reader" underline.
const PATTERN_STEMS = new Set<string>();
for (const p of symptomPatterns) {
  for (const term of [p.pl_label, ...p.pl_terms]) {
    for (const tok of tokenize(term)) PATTERN_STEMS.add(stem(tok));
  }
}
function isRecognized(word: string): boolean {
  const toks = tokenize(word);
  return toks.length > 0 && toks.some((tk) => PATTERN_STEMS.has(stem(tk)));
}
/** Render text with recognized words wrapped in an ochre <mark> (the signature interaction). */
function highlight(text: string): ReactNode[] {
  if (!text) return [];
  return text.split(/(\s+)/).map((part, i) =>
    /\s/.test(part) || part === '' ? (
      <span key={i}>{part}</span>
    ) : isRecognized(part) ? (
      <mark className="mark" key={i}>{part}</mark>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

function ResultCard({ result, ctx }: { result: MatchResult; ctx: UserContext }) {
  const { pattern } = result;
  const sites = sitesForPattern(pattern, ctx);
  const ageEmphasis =
    ctx.age != null && pattern.age_context_min != null && ctx.age >= pattern.age_context_min;
  const isRed = pattern.red_flag;

  return (
    <article className="card reveal is-in">
      {isRed && <span className="card__hair" aria-hidden="true" />}
      <div className="tier__head">
        <Lamp tier={isRed ? 'uwaga' : 'profilaktyka'} />
        <span className="eyebrow">{t.cardHeader}</span>
        <span className="chip" style={{ marginLeft: 'auto' }}>{t.inlineDisclaimer}</span>
      </div>

      <h3 style={{ fontVariationSettings: 'var(--fraunces-title)', fontSize: 'var(--step-1)', marginTop: 'var(--space-3)' }}>
        {pattern.pl_label}
      </h3>

      <p style={{ marginTop: 'var(--space-2)', color: 'var(--text-1)' }}>
        <strong>{t.whatToDo}:</strong> {pattern.guidance_pl}
      </p>
      {ageEmphasis && (
        <p style={{ marginTop: 'var(--space-2)', color: 'var(--red-flag-ink)', fontWeight: 600 }}>{t.ageEmphasis}</p>
      )}
      {pattern.caveat_pl && (
        <p style={{ marginTop: 'var(--space-2)', color: 'var(--text-2)', fontSize: 'var(--step--1)' }}>{pattern.caveat_pl}</p>
      )}

      {sites.length > 0 && (
        <div className="data-well" style={{ marginTop: 'var(--space-4)' }}>
          <p className="eyebrow" style={{ marginBottom: 'var(--space-2)' }}>{t.howCommon}</p>
          <div className="stack">
            {sites.map((c) => (
              <div key={c.id}>
                <span className="stat tnum">~{numberPl(c.incidence.annual_new_cases_pl)}</span>{' '}
                <span className="stat__unit">{t.casesPerYear} · {c.pl_name}</span>
                <div className="receipt" style={{ marginTop: 2 }}>
                  źródło: {c.incidence.verified ? 'KRN' : 'KRN (szac.)'} · {c.incidence.as_of_year}
                  {!c.incidence.verified && <span>· {t.seedNote}</span>}
                </div>
              </div>
            ))}
          </div>
          <p className="context-note" style={{ marginTop: 'var(--space-3)' }}>{t.context}</p>
        </div>
      )}

      <div style={{ marginTop: 'var(--space-4)' }}>
        <Receipt sourceId={pattern.source_id} />
      </div>
    </article>
  );
}

function EmergencyCard({ result }: { result: MatchResult }) {
  return (
    <article className="tier tier--nagly" role="alert">
      <div className="tier__head">
        <Lamp tier="nagly" />
        <span className="tier__label">{t.emergency}</span>
      </div>
      <h3 style={{ fontVariationSettings: 'var(--fraunces-title)', fontSize: 'var(--step-1)', marginTop: 'var(--space-2)' }}>
        {result.pattern.pl_label}
      </h3>
      <p style={{ marginTop: 'var(--space-2)', color: 'var(--text-1)' }}>{result.pattern.guidance_pl}</p>
      <a className="btn btn--emergency" href="tel:112" style={{ marginTop: 'var(--space-3)' }}>Zadzwoń 112</a>
    </article>
  );
}

function DiloPanel() {
  return (
    <section className="card">
      <div className="tier__head">
        <Lamp tier="uwaga" />
        <span className="eyebrow">{ui.sections.dilo.n} · {ui.dilo.heading}</span>
      </div>
      <p className="pullquote" style={{ marginTop: 'var(--space-3)' }}>„{ui.dilo.quote}"</p>
      <p style={{ marginTop: 'var(--space-3)', color: 'var(--text-2)' }}>{dilo.intro_pl}</p>

      <div style={{ marginTop: 'var(--space-4)' }}>
        <p className="eyebrow" style={{ marginBottom: 'var(--space-2)' }}>{ui.dilo.deadlines}</p>
        {dilo.deadlines.map((d, i) => (
          <div className="dilo__stage" key={i}>
            <div className="dilo__day">{d.days}<small>{ui.dilo.days}</small></div>
            <div style={{ alignSelf: 'center', color: 'var(--text-1)' }}>{d.stage_pl}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 'var(--space-4)' }}>
        <p className="eyebrow" style={{ marginBottom: 'var(--space-2)' }}>{ui.dilo.rights}</p>
        <ul className="stack" style={{ paddingLeft: '1.2em', color: 'var(--text-2)' }}>
          {dilo.rights_pl.map((r, i) => <li key={i}>{r}</li>)}
        </ul>
      </div>

      <div style={{ marginTop: 'var(--space-4)' }}>
        <p className="eyebrow" style={{ marginBottom: 'var(--space-2)' }}>{ui.dilo.whatToAsk}</p>
        <div className="dilo__script stack">
          {dilo.what_to_ask_pl.map((q, i) => <p key={i}>• {q}</p>)}
        </div>
      </div>

      <div style={{ marginTop: 'var(--space-4)' }}><Receipt sourceId={dilo.source_id} /></div>
    </section>
  );
}

export default function SymptomSearch() {
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [sex, setSex] = useState<'' | 'female' | 'male'>('');
  const [ageStr, setAgeStr] = useState('');
  const taRef = useRef<HTMLTextAreaElement>(null);

  const ctx: UserContext = useMemo(() => {
    const age = ageStr.trim() === '' ? undefined : Number(ageStr);
    return { sex: sex || undefined, age: age != null && Number.isFinite(age) ? age : undefined };
  }, [sex, ageStr]);

  const results = useMemo(() => {
    if (!submitted) return [] as MatchResult[];
    const r = matchSymptoms(submitted, symptomPatterns);
    // emergency tier always sorts to the very top
    return [...r].sort(
      (a, b) => Number(b.pattern.urgency === 'emergency') - Number(a.pattern.urgency === 'emergency')
    );
  }, [submitted]);

  const emergencies = results.filter((r) => r.pattern.urgency === 'emergency');
  const normal = results.filter((r) => r.pattern.urgency !== 'emergency');
  const hasRedFlag = normal.some((r) => r.pattern.red_flag);

  const grow = () => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${ta.scrollHeight}px`;
  };

  return (
    <div>
      <form onSubmit={(e) => { e.preventDefault(); setSubmitted(query); }}>
        <div className="field">
          <label htmlFor="symptoms" className="field__label">{t.label}</label>
          <div className="field__wrap">
            <div className="field__mirror" aria-hidden="true">{highlight(query)}{'\n'}</div>
            <textarea
              id="symptoms"
              ref={taRef}
              className="field__input"
              value={query}
              onChange={(e) => { setQuery(e.target.value); }}
              onInput={grow}
              placeholder={t.placeholder}
              autoComplete="off"
              rows={3}
            />
            <div className="field__baseline" aria-hidden="true" />
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', alignItems: 'center', marginTop: 'var(--space-3)' }}>
            <fieldset style={{ border: 0, padding: 0, margin: 0, display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
              <legend className="eyebrow" style={{ float: 'left', marginRight: 'var(--space-3)' }}>
                {ui.context.heading} <span style={{ textTransform: 'none' }}>({ui.context.optional})</span>
              </legend>
              <div className="segmented" role="group" aria-label={ui.context.sex}>
                {(['', 'female', 'male'] as const).map((val) => (
                  <button type="button" key={val || 'none'} aria-pressed={sex === val} onClick={() => setSex(val)}>
                    {val === '' ? ui.context.unknown : val === 'female' ? ui.context.female : ui.context.male}
                  </button>
                ))}
              </div>
              <label className="chip">
                {ui.context.age}
                <input type="number" min={0} max={120} value={ageStr} inputMode="numeric" aria-label={ui.context.age}
                  onChange={(e) => setAgeStr(e.target.value)}
                  style={{ width: '3.5rem', border: 0, background: 'transparent', color: 'var(--text-1)', fontFamily: 'var(--font-mono)' }} />
              </label>
            </fieldset>
            <button type="submit" className="btn btn--accent" style={{ marginLeft: 'auto' }}>{t.button}</button>
          </div>

          <p className="receipt" style={{ marginTop: 'var(--space-3)' }}>{t.privacy}</p>
        </div>
      </form>

      <div style={{ marginTop: 'var(--space-6)' }} role="region" aria-label={t.resultsHeading} aria-live="polite" className="stack">
        {!submitted && <p style={{ color: 'var(--text-3)' }}>{t.empty}</p>}

        {submitted && results.length === 0 && (
          <p className="data-well" style={{ color: 'var(--text-2)' }}>{t.noMatch}</p>
        )}

        {emergencies.map((r) => <EmergencyCard key={r.pattern.id} result={r} />)}

        {normal.length > 0 && (
          <>
            <div className="tier__head">
              <span className="section__num">{ui.sections.signal.n}</span>
              <h2 style={{ fontVariationSettings: 'var(--fraunces-title)', fontSize: 'var(--step-2)' }}>{t.resultsHeading}</h2>
            </div>
            {normal.map((r) => <ResultCard key={r.pattern.id} result={r} ctx={ctx} />)}
          </>
        )}

        {hasRedFlag && <DiloPanel />}
        {results.length > 0 && <ScreeningPanel ctx={ctx} />}
        {results.length > 0 && <DoctorSummary results={results} ctx={ctx} query={submitted} />}
      </div>
    </div>
  );
}
