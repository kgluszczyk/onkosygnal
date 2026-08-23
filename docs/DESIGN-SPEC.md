# OnkoSygnał — Design System: „Cichy Przyrząd — Patyna & Bursztyn"

*(Quiet Instrument, warmed by the Letter.) Chosen via a 4-direction judge panel; this is the
implementation source of truth. Register: **calm authority + humane clarity**, never alarmist,
never sterile.*

## Concept
A calm precision instrument that speaks with a human voice. Warm bone-paper + graphite ink; two
Polish materials do all the emotional coloring, no flag kitsch: **patyna** (verdigris copper of
Kraków/Wawel roofs) = structure + interaction; **bursztyn** (Baltic amber) = "attention" + data
highlight. **True red is quarantined to the single 112/SOR emergency tier** and appears nowhere
else. Every fact wears a mono **provenance receipt** (`źródło: … • akt. …`). Statistics are always
population context (`~X osób rocznie` / `1 na X`), never a %, gauge, or personal-risk math, always
captioned *„to kontekst, nie Twoje ryzyko"*.

## Signatures
1. **Patyna & Bursztyn** — verdigris = only structural/interaction accent; amber = only attention/data highlight.
2. **Kwit proweniencyjny** — a mono `źródło:` receipt on every fact.
3. **Ochrowe podkreślenie** — the user's own worrying words get a soft ochre caring-reader underline (attention, not alarm).
4. **Kalibracja tick-rule** — data on a hairline calibrated scale with mono section numbers 01–07; never a gauge/%.
5. **Banderola edukacyjna** — persistent non-dismissible disclaimer: sticky eyebrow + inline at input + on every card.
6. **Sygnał lamps** — colour **+ distinct shape + text label**: Uwaga = amber square · Nagły = red octagon · Profilaktyka = green check (colorblind/print safe).
7. **Kreska tuszem** — single-ink botanical/object engraving motifs. Literal organ/tumour imagery FORBIDDEN.
8. **Ambient** — warm paper grain (light) / graphite noise (dark), soft top-light, faint contour lines; print- and reduced-motion-disabled.

## Type
- **Display** — Fraunces Variable (`@fontsource-variable/fraunces`), low WONK (~8–15), SOFT ~40 — characterful but sober.
- **Body/UI** — Fira Sans (`@fontsource/fira-sans` 400/500/600/700) — flawless Polish diacritics, warm humanist.
- **Data/mono** — IBM Plex Mono (`@fontsource/ibm-plex-mono` 400/500/600) — receipts, figures, eyebrows; `tnum,lnum`.
- Fluid `clamp()` scale `--step--2 … --step-6` + `--step-stat`; body 17→19px, leading 1.6 (room for ą/ę/ł).

## Color tokens (OKLCH; AA-verified in both themes)
Light `:root` / Dark `:root[data-theme=dark]` (+ `@media (prefers-color-scheme: dark)` fallback).
Keys: `--bg --surface --surface-2 --text-1 --text-2 --text-3 --border --border-strong --accent
--accent-strong --accent-contrast --red-flag --red-flag-ink --red-flag-bg --emergency
--emergency-ink --emergency-bg --positive --positive-ink --ring`. **Hard rules:** amber/green are
fills-under-ink only; colored small text uses the `*-ink` variant; emergency red is white-on-fill /
reserved for 112 only; links use `--accent-strong`. (Exact values live in `src/styles/tokens/`.)

## Homepage = narrative scroll-story (01–07 + podpis)
Hero (banderola + Fraunces headline „Wsłuchaj się w sygnały. Zrozum je. Działaj spokojnie." +
first-class symptom tool + persistent 112 affordance) → 01 Sygnał → 02 Kontekst, nie wyrok (KRN on
tick-rule) → 03 Objawy alarmowe → 04 Masz prawo do DiLO → 05 Bezpłatne badania NFZ → 06 Weź to do
lekarza (printout) → 07 Kiedy nie czekać (emergency rupture) → Podpis + colophon.

## Tech
Astro 7 static + 3 React islands only (symptom tool `client:visible`, screening `client:visible`,
theme toggle `client:idle`) + Tailwind v4 CSS-first (`@theme inline` maps tokens to utilities).
No-flash theme via inline `<head>` script. Self-hosted `@fontsource` latin-ext. Print CSS strips
colour/grain to ink-on-white A4 and re-encodes tiers by label + shape.

*Full synthesized spec + the 4 directions + judge rationales: workflow `wf_ff6d9016-e94`.*
