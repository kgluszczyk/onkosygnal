import { screeningForUser, getSource, type UserContext } from '../lib/kb';
import { ui } from '../i18n/ui';

const s = ui.screening;

export function ScreeningPanel({ ctx }: { ctx: UserContext }) {
  const programs = screeningForUser(ctx);

  if (programs.length === 0) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="font-semibold text-slate-900">{s.heading}</h3>
        <p className="mt-2 text-sm text-slate-500">{s.none}</p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-teal-200 bg-white p-4">
      <h3 className="font-semibold" style={{ color: 'var(--brand-ink)' }}>{s.heading}</h3>
      <p className="mt-1 text-sm text-slate-600">{s.intro}</p>
      <ul className="mt-3 space-y-3">
        {programs.map((p) => {
          const src = getSource(p.source_id);
          return (
            <li key={p.id} className="text-sm text-slate-700">
              <p className="font-medium text-slate-900">{p.pl_name}</p>
              <p>{p.pl_description}</p>
              {p.booking_pl && <p className="text-slate-500">{p.booking_pl}</p>}
              {src && (
                <p className="mt-1 text-xs text-slate-500">
                  {ui.search.source}:{' '}
                  <a href={src.url} target="_blank" rel="noopener noreferrer"
                    className="underline hover:text-slate-600">{src.publisher}</a>
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
