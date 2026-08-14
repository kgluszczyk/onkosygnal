"""Validate data/ against the pydantic contract and enforce the provenance/verification gates.

Exit code 0 = valid (warnings allowed), 1 = schema/reference error.
Run: uv run python -m pipeline.validate
"""

from __future__ import annotations

import sys

from pydantic import ValidationError

from pipeline._load import load_kb


def main() -> int:
    try:
        kb = load_kb()
    except (ValidationError, ValueError) as e:
        print("[validate] FAILED — data does not satisfy the contract:\n")
        print(e)
        return 1
    except FileNotFoundError as e:
        print(f"[validate] FAILED — missing data file: {e}")
        return 1

    print(
        f"[validate] OK — {len(kb.sources)} sources, {len(kb.cancer_sites)} cancer sites, "
        f"{len(kb.symptom_patterns)} symptom patterns."
    )

    # --- soft gates (warnings, non-fatal) ---------------------------------------
    warnings = 0

    unverified = [c.id for c in kb.cancer_sites if not c.incidence.verified]
    if unverified:
        warnings += 1
        print(
            f"[validate] WARNING — incidence not yet verified against KRN for: "
            f"{', '.join(unverified)}. Do NOT present these as fact before verifying."
        )

    no_guidance = [p.id for p in kb.symptom_patterns if not p.guidance_pl.strip()]
    if no_guidance:
        warnings += 1
        print(f"[validate] WARNING — empty guidance for patterns: {', '.join(no_guidance)}")

    # every red flag should carry an honest caveat
    missing_caveat = [p.id for p in kb.symptom_patterns if p.red_flag and not p.caveat_pl]
    if missing_caveat:
        warnings += 1
        print(
            f"[validate] WARNING — red-flag patterns without an honest caveat: "
            f"{', '.join(missing_caveat)}"
        )

    print(f"[validate] done ({warnings} warning group(s)).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
