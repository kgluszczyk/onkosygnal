# Launch checklist — Tier-0 blockers (owner: you, not the code)

These are the things that must be resolved before OnkoSygnał is shown to real users.
They are **not** engineering tasks — the code is ready; these require a clinician, a
lawyer, and source verification. Do not deploy publicly until every box here is ticked.

## 1. Verify all medical numbers against primary sources
- [ ] Replace the seed KRN incidence figures in `data/cancer_sites.json` with values
      extracted from the actual KRN report, then set each `incidence.verified: true`.
      `pipeline/validate.py` warns while any remain `verified: false`.
- [ ] Verify the NFZ screening age ranges/intervals in `data/screening.json`
      (mammografia 45–74/2y, cytologia 25–64/3y, kolonoskopia 50–65) against the current
      NFZ programme pages — these criteria change.
- [ ] Verify the DiLO deadlines in `data/dilo.json` against the current MZ regulation.

## 2. Clinical review of ALL content
- [ ] A licensed Polish clinician reviews every `symptom_patterns.json` entry
      (labels, `guidance_pl`, `caveat_pl`, `red_flag`, `urgency`) and the
      `early_signs_pl` per cancer site. Record who reviewed and when.
- [ ] Confirm the emergency-tier patterns (`massive-bleeding`, `acute-dyspnoea`) and their
      112/SOR guidance are clinically appropriate.
- [ ] Add a named responsible party / editorial policy (health tools need this for trust).

## 3. Regulatory opinion (EU MDR / URPL)
- [ ] Obtain a written opinion that the tool, as scoped (educational sign-posting, no
      personal probability, no per-user storage), stays outside medical-device
      qualification in Poland — or, if it does not, plan the CE/URPL pathway.
- [ ] Do not add any personal probability/risk output without redoing this analysis.

## 4. Legal / privacy
- [ ] Lawyer finalizes `/prywatnosc` (RODO) and `/regulamin` — currently drafts.
- [ ] Fill in the contact address and "last updated" dates in those pages.

## 5. Accessibility
- [ ] WCAG 2.1 AA audit (contrast, keyboard nav, screen-reader labels, form errors).

## 6. Deployment
- [ ] Decide final name + domain (currently placeholder "OnkoSygnał" / onkosygnal.pl —
      change in `site/astro.config.mjs`, `site/src/i18n/ui.ts`, `site/wrangler.toml`).
- [ ] Create the Cloudflare Pages project; wire `PUBLIC_CF_BEACON` if analytics wanted.
- [ ] Create the GitHub remote so CI (`.github/workflows/ci.yml`) runs on PRs.

---

## Done in this repo (engineering + product)
- Deterministic Polish matcher: diacritic folding, suffix stemming, prefix/typo tolerance,
  negation handling (`site/src/lib/match.ts`, 15 unit tests).
- Sex/age context (never used to hide guidance) + urgency tiering (emergency/urgent/routine)
  with a 112/SOR banner.
- Free NFZ screening-programme sign-posting by sex/age.
- Doctor hand-off printout (print-only stylesheet, no data stored).
- CI (pipeline validate + schema-drift check + site check/unit/build + Playwright e2e),
  LICENSE, cookieless opt-in analytics, draft RODO/terms pages.
