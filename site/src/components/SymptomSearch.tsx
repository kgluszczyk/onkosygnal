import { useMemo, useState } from 'react';
import { matchSymptoms, type MatchResult } from '../lib/match';
import { symptomPatterns, sitesForPattern, getSource, dilo } from '../lib/kb';
import { ui } from '../i18n/ui';

const t = ui.search;
const numberPl = (n: number) => n.toLocaleString('pl-PL');

function SourceLink({ sourceId }: { sourceId: string }) {
  const s = getSource(sourceId);
  if (!s) return null;
  return (
    <a
      href={s.url}
      target="_blank"
      rel="noopener noreferrer"
      className="underline text-slate-500 hover:text-slate-700"
    >
      {s.publisher}
    </a>
  );
}

function ResultCard({ result }: { result: MatchResult }) {
  const { pattern } = result;
  const sites = sitesForPattern(pattern);
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 flex-wrap">
        <h3 className="font-semibold text-slate-900">{pattern.pl_label}</h3>
        <span
          className={
            'text-xs px-2 py-0.5 rounded-full ' +
            (pattern.red_flag
              ? 'bg-amber-100 text-amber-800'
              : 'bg-slate-100 text-slate-600')
          }
        >
          {pattern.red_flag ? t.redFlag : t.common}
        </span>
      </div>

      <p className="mt-2 text-sm text-slate-800">
        <strong>{t.whatToDo}:</strong> {pattern.guidance_pl}
      </p>
      {pattern.caveat_pl && (
        <p className="mt-1 text-sm text-slate-500">{pattern.caveat_pl}</p>
      )}

      {sites.length > 0 && (
        <div className="mt-3 border-t border-slate-100 pt-3">
          <p className="text-xs uppercase tracking-wide text-slate-400">{t.howCommon}</p>
          <ul className="mt-1 space-y-1">
            {sites.map((c) => (
              <li key={c.id} className="text-sm text-slate-700">
                {c.pl_name}: ~{numberPl(c.incidence.annual_new_cases_pl)}{' '}
                {t.casesPerYear}{' '}
                <span className="text-slate-400">
                  ({c.incidence.as_of_year}, {t.seedNote})
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-1 text-xs text-slate-400">{t.context}</p>
        </div>
      )}

      <p className="mt-3 text-xs text-slate-400">
        {t.source}: <SourceLink sourceId={pattern.source_id} />
      </p>
    </article>
  );
}

function DiloPanel() {
  return (
    <section className="rounded-lg border-2 border-teal-200 bg-teal-50 p-4">
      <h3 className="font-semibold" style={{ color: 'var(--brand-ink)' }}>
        {ui.dilo.heading}
      </h3>
      <p className="mt-2 text-sm text-slate-700">{dilo.intro_pl}</p>

      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">{ui.dilo.rights}</p>
          <ul className="mt-1 list-disc list-inside text-sm text-slate-700 space-y-1">
            {dilo.rights_pl.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">{ui.dilo.deadlines}</p>
          <ul className="mt-1 text-sm text-slate-700 space-y-1">
            {dilo.deadlines.map((d, i) => (
              <li key={i}>
                <strong>{d.days}</strong> {ui.dilo.days} — {d.stage_pl}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-3">
        <p className="text-xs uppercase tracking-wide text-slate-400">{ui.dilo.whatToAsk}</p>
        <ul className="mt-1 list-disc list-inside text-sm text-slate-700 space-y-1">
          {dilo.what_to_ask_pl.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      </div>
      <p className="mt-3 text-xs text-slate-400">
        {ui.search.source}: <SourceLink sourceId={dilo.source_id} />
      </p>
    </section>
  );
}

export default function SymptomSearch() {
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');

  const results = useMemo(
    () => (submitted ? matchSymptoms(submitted, symptomPatterns) : []),
    [submitted]
  );
  const hasRedFlag = results.some((r) => r.pattern.red_flag);

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(query);
        }}
      >
        <label htmlFor="symptoms" className="block font-medium text-slate-800">
          {t.label}
        </label>
        <div className="mt-2 flex gap-2">
          <input
            id="symptoms"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.placeholder}
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-slate-900"
            autoComplete="off"
          />
          <button
            type="submit"
            className="rounded-md px-4 py-2 text-white font-medium"
            style={{ background: 'var(--brand)' }}
          >
            {t.button}
          </button>
        </div>
      </form>

      <div className="mt-6 space-y-4">
        {!submitted && <p className="text-slate-500">{t.empty}</p>}
        {submitted && results.length === 0 && (
          <p className="rounded-md bg-slate-100 p-4 text-slate-700">{t.noMatch}</p>
        )}
        {results.length > 0 && (
          <>
            <h2 className="font-semibold text-slate-900">{t.resultsHeading}</h2>
            {results.map((r) => (
              <ResultCard key={r.pattern.id} result={r} />
            ))}
            {hasRedFlag && <DiloPanel />}
          </>
        )}
      </div>
    </div>
  );
}
