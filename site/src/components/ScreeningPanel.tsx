import { screeningForUser, type UserContext } from '../lib/kb';
import { ui } from '../i18n/ui';
import { Lamp, Receipt } from './ui';

const s = ui.screening;

export function ScreeningPanel({ ctx }: { ctx: UserContext }) {
  const programs = screeningForUser(ctx);

  return (
    <section className="card" id="badania">
      <div className="tier__head">
        <Lamp tier="profilaktyka" />
        <span className="eyebrow">{ui.sections.screening.n} · {s.heading}</span>
      </div>

      {programs.length === 0 ? (
        <p style={{ marginTop: 'var(--space-3)', color: 'var(--text-3)' }}>{s.none}</p>
      ) : (
        <>
          <p style={{ marginTop: 'var(--space-3)', color: 'var(--text-2)' }}>{s.intro}</p>
          <div>
            {programs.map((p) => (
              <div className="screening-row" key={p.id}>
                <Lamp tier="profilaktyka" />
                <div>
                  <p style={{ fontWeight: 600, color: 'var(--text-1)' }}>{p.pl_name}</p>
                  <p style={{ color: 'var(--positive-ink)', fontSize: 'var(--step--1)', fontWeight: 600 }}>{s.eligible}</p>
                  <p style={{ color: 'var(--text-2)', fontSize: 'var(--step--1)', marginTop: 2 }}>{p.pl_description}</p>
                  <p className="meta" style={{ marginTop: 4 }}>
                    {s.ageRange} {p.age_min}–{p.age_max}
                    {p.interval_years ? <> · {s.every} {p.interval_years} {s.years}</> : null}
                  </p>
                  {p.booking_pl && <p style={{ color: 'var(--text-3)', fontSize: 'var(--step--1)', marginTop: 2 }}>{p.booking_pl}</p>}
                  <div style={{ marginTop: 6 }}><Receipt sourceId={p.source_id} /></div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
