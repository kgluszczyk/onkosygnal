# OnkoSygnał

**Polish-language cancer *awareness & sign-posting* tool — not a diagnostic device.**

A user describes symptoms in free text → the tool matches recognized **red-flag patterns**,
shows *how common* the relevant cancer is in Poland (KRN incidence, as context — never a
personal risk score), the official early-warning signs, and — the differentiator — the
patient's right to the **DiLO fast-track oncology pathway** and exactly what to say to their
POZ (primary-care) doctor.

> **To narzędzie edukacyjne, nie diagnoza.** Nie oblicza Twojego ryzyka raka — pokazuje,
> które objawy warto skonsultować z lekarzem POZ i jak. W razie niepokojących objawów
> zawsze zgłoś się do lekarza.

## Why this scope (read before adding features)

This project deliberately does **NOT**:

- output a personal probability / risk score ("X% szans na raka"),
- say "masz / nie masz nowotworu",
- store per-user data.

Rationale (from the feasibility research):

1. **No Polish symptom-PPV data exists.** All symptom→cancer positive-predictive-value data
   is UK-derived (CAPER/Hamilton, NICE NG12). Poland's KRN publishes *incidence*, not
   symptom PPVs. A personal probability for Polish users would be a transplanted UK number —
   scientifically indefensible.
2. **Regulatory.** Under EU MDR, software that ingests patient symptoms and outputs a
   diagnosis/triage/probability is almost certainly a **Class IIa medical device** (Rule 11).
   "Not medical advice" disclaimers do not exempt it. Educational sign-posting stays on the
   safe side of that line — but get a Polish regulatory opinion before any public launch.
3. **Psychology.** Single-symptom PPVs are ~2–3%; a personal "2.4% chance of cancer" both
   alarms and falsely reassures. A clinician contextualizes such numbers; a consumer app
   should not surface them.

The moment a personal probability is added, the project re-enters the regulated,
data-missing, psychologically-fraught zone. **Don't cross that line.**

## Architecture (mirrors the `megalo` stack)

```
pipeline/   Python (uv + pydantic v2) — canonical data contract, validation, schema export
schema/     JSON Schema exported from the pydantic models (for extraction/curation agents)
data/       Canonical curated JSON (source of truth for content): sites, patterns, DiLO, sources
site/       Astro 7 + React 19 + Tailwind 4 + TypeScript static site → Cloudflare Pages
```

Data flows `data/*.json` → (`site/scripts/sync-data.mjs`) → `site/src/data/*.json` (committed
copies are the build-time source of truth, so Cloudflare builds stay green without the pipeline).

## Quick start

Pipeline (validate the curated knowledge base):

```bash
uv sync
uv run python -m pipeline.validate      # validates data/ against the pydantic models
uv run python -m pipeline.export_schema # (re)generate schema/*.schema.json
uv run python -m pipeline.stats         # counts + coverage summary
```

Site:

```bash
cd site
npm install
npm run dev        # http://localhost:4321  (predev syncs data from ../data)
npm run test:unit  # vitest — matcher unit tests
npm run test:e2e   # Playwright smoke tests (build first; uses port 4373)
npm run check      # astro type-check
npm run build
```

## What v1 does

- **Free-text symptom matching** (`site/src/lib/match.ts`): diacritic folding, light Polish
  suffix stemming, prefix/typo tolerance, and negation handling ("nie mam..." won't match).
  It is retrieval, not risk scoring — no probability is ever computed or shown.
- **Optional sex/age context** (never stored, never used to hide guidance) that tailors the
  incidence context and unlocks the screening panel.
- **Urgency tiers** (emergency / urgent / routine) with a 112/SOR banner for emergencies.
- **Free NFZ screening sign-posting** (mammografia / cytologia / kolonoskopia) by sex+age.
- **Doctor hand-off printout** — a print-only summary the patient brings to their POZ visit.
- **DiLO fast-track module** — the patient's rights + statutory deadlines + what to ask.

CI (`.github/workflows/ci.yml`) runs the pipeline validation, a schema-drift check, and the
site check/unit/build/e2e on every PR.

## Before going live

See [docs/LAUNCH-CHECKLIST.md](docs/LAUNCH-CHECKLIST.md) — the Tier-0 medical, regulatory,
and legal blockers that are the operator's to resolve (clinician review, KRN verification,
MDR opinion). The code is ready; those are not code tasks.

## Data provenance & verification gate

Every content record carries a `source_id` into `data/sources.json`. Incidence figures carry
`verified: false` until checked against the latest KRN report — `pipeline/validate.py` warns on
any unverified incidence so nothing ships as fact by accident. **The seed incidence numbers are
approximate placeholders and MUST be verified against the KRN PDF before launch.**

## Status

v1 skeleton — seed knowledge base (~8 cancer sites, ~12 red-flag patterns, DiLO module).
Not for clinical use.
