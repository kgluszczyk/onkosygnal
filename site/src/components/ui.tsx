// Shared design-language primitives: signal Lamp (colour + shape + always a text label),
// provenance Receipt (mono "źródło: …"). See docs/DESIGN-SPEC.md.
import { getSource } from '../lib/kb';

export type Tier = 'uwaga' | 'nagly' | 'profilaktyka';

/** A signal lamp. Meaning is carried by colour + SHAPE; callers ALWAYS pair it with a text label. */
export function Lamp({ tier, className = '' }: { tier: Tier; className?: string }) {
  if (tier === 'nagly') {
    return (
      <span className={`lamp lamp--nagly ${className}`} aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="M12 6v8" strokeLinecap="round" /><circle cx="12" cy="18" r="0.6" fill="currentColor" stroke="none" /></svg>
      </span>
    );
  }
  if (tier === 'profilaktyka') {
    return (
      <span className={`lamp lamp--profilaktyka ${className}`} aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="M5 13l4 4 10-11" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </span>
    );
  }
  return <span className={`lamp lamp--uwaga ${className}`} aria-hidden="true" />;
}

/** Mono provenance receipt rendered from a source record. */
export function Receipt({ sourceId, extra }: { sourceId: string; extra?: string }) {
  const s = getSource(sourceId);
  if (!s) return null;
  return (
    <span className="receipt">
      <span>źródło:</span>{' '}
      <a href={s.url} target="_blank" rel="noopener noreferrer">{s.publisher}</a>
      {extra ? <span>· {extra}</span> : null}
      <span>· akt. {s.retrieved}</span>
    </span>
  );
}
