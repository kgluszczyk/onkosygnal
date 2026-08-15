import type { MatchResult } from '../lib/match';
import { getSource, type UserContext } from '../lib/kb';
import { ui } from '../i18n/ui';

const d = ui.doctor;

/**
 * A print-friendly hand-off the patient brings to their POZ appointment.
 * Deliberately NOT a medical document: lists the symptoms the tool surfaced, the
 * user's own words, and the guideline references — no diagnosis, no probability.
 * Printing uses a visibility trick (see global.css @media print) to print only
 * this block. No data is stored or transmitted.
 */
export function DoctorSummary({
  results,
  ctx,
  query,
}: {
  results: MatchResult[];
  ctx: UserContext;
  query: string;
}) {
  const today = new Date().toLocaleDateString('pl-PL');
  const hasRedFlag = results.some((r) => r.pattern.red_flag);
  const ctxBits = [
    ctx.sex ? (ctx.sex === 'female' ? ui.context.female : ui.context.male) : null,
    ctx.age != null ? `${ui.context.age.toLowerCase()}: ${ctx.age}` : null,
  ].filter(Boolean);

  return (
    <section className="doctor-summary rounded-lg border border-slate-300 bg-white p-4">
      <div className="flex items-center justify-between gap-2 no-print">
        <h3 className="font-semibold text-slate-900">{d.button}</h3>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
        >
          {d.print}
        </button>
      </div>

      <div className="mt-3 text-sm text-slate-800">
        <p className="text-base font-semibold text-slate-900">{d.heading}</p>
        <p className="text-xs text-slate-500">
          {d.generated}: {today}
          {ctxBits.length > 0 && ` · ${ctxBits.join(' · ')}`}
        </p>

        <p className="mt-3 font-medium">{d.yourWords}:</p>
        <blockquote className="border-l-2 border-slate-300 pl-3 text-slate-600 italic">
          {query}
        </blockquote>

        <p className="mt-3 font-medium">{d.symptoms}:</p>
        <ul className="mt-1 list-disc list-inside space-y-1">
          {results.map((r) => {
            const src = getSource(r.pattern.source_id);
            const tag =
              r.pattern.urgency === 'emergency'
                ? ` (${ui.search.emergency})`
                : r.pattern.red_flag
                  ? ` (${ui.search.redFlag})`
                  : '';
            return (
              <li key={r.pattern.id}>
                {r.pattern.pl_label}
                {tag}
                {r.pattern.duration_context_pl ? ` — ${r.pattern.duration_context_pl}` : ''}
                {src ? <span className="text-slate-400"> [{src.title}]</span> : null}
              </li>
            );
          })}
        </ul>

        {hasRedFlag && <p className="mt-3 text-slate-700">{d.diloNote}</p>}

        <p className="mt-4 text-xs text-slate-400 border-t border-slate-200 pt-2">{d.footer}</p>
      </div>
    </section>
  );
}
