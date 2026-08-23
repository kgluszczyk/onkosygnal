import type { MatchResult } from '../lib/match';
import { getSource, type UserContext } from '../lib/kb';
import { ui } from '../i18n/ui';

const d = ui.doctor;

/**
 * Print-friendly hand-off the patient brings to their POZ appointment. NOT a medical document.
 * Tiers are re-encoded by LABEL (never colour) so it survives the monochrome print.
 * Printing uses the print.css visibility approach; no data is stored or transmitted.
 */
export function DoctorSummary({ results, ctx, query }: { results: MatchResult[]; ctx: UserContext; query: string }) {
  const today = new Date().toLocaleDateString('pl-PL');
  const hasRedFlag = results.some((r) => r.pattern.red_flag);
  const ctxBits = [
    ctx.sex ? (ctx.sex === 'female' ? ui.context.female : ui.context.male) : null,
    ctx.age != null ? `${ui.context.age.toLowerCase()}: ${ctx.age}` : null,
  ].filter(Boolean);

  const tierLabel = (r: MatchResult) =>
    r.pattern.urgency === 'emergency' ? `[${ui.search.emergency}]` : r.pattern.red_flag ? `[${ui.search.redFlag}]` : '';

  return (
    <section className="doctor-summary card" id="dla-lekarza">
      <div className="tier__head no-print">
        <span className="section__num">{ui.sections.doctor.n}</span>
        <span className="eyebrow">{d.button}</span>
        <button type="button" onClick={() => window.print()} className="btn btn--ghost" style={{ marginLeft: 'auto' }}>
          {d.print}
        </button>
      </div>

      <h3 style={{ fontVariationSettings: 'var(--fraunces-head)', fontSize: 'var(--step-2)', marginTop: 'var(--space-3)' }}>{d.heading}</h3>
      <p className="receipt" style={{ marginTop: 4 }}>
        {d.generated}: {today}{ctxBits.length > 0 && ` · ${ctxBits.join(' · ')}`}
      </p>

      <p className="eyebrow" style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-2)' }}>{d.yourWords}</p>
      <blockquote style={{ borderLeft: '3px solid var(--border-strong)', paddingLeft: 'var(--space-3)', color: 'var(--text-2)', fontStyle: 'italic' }}>
        {query}
      </blockquote>

      <p className="eyebrow" style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-2)' }}>{d.symptoms}</p>
      <ul className="stack" style={{ paddingLeft: '1.2em', color: 'var(--text-1)' }}>
        {results.map((r) => {
          const src = getSource(r.pattern.source_id);
          return (
            <li key={r.pattern.id}>
              <span className="mono">{tierLabel(r)}</span> {r.pattern.pl_label}
              {r.pattern.duration_context_pl ? ` — ${r.pattern.duration_context_pl}` : ''}
              {src ? <span className="receipt" style={{ marginLeft: 6 }}>[{src.title}]</span> : null}
            </li>
          );
        })}
      </ul>

      {hasRedFlag && <p style={{ marginTop: 'var(--space-3)', color: 'var(--text-2)' }}>{d.diloNote}</p>}

      <p className="eyebrow" style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-2)' }}>{d.notes}</p>
      <div style={{ borderTop: '1px solid var(--border)', height: '4.5rem' }} aria-hidden="true" />

      <p className="receipt" style={{ display: 'block', marginTop: 'var(--space-4)', borderTop: '1px solid var(--border)', paddingTop: 'var(--space-2)' }}>
        {d.footer}
      </p>
    </section>
  );
}
