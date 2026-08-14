"""Coverage summary for the curated knowledge base.

Run: uv run python -m pipeline.stats
"""

from __future__ import annotations

from pipeline._load import load_kb


def main() -> None:
    kb = load_kb()
    # ASCII-only console output — the Windows host console is cp1250 and chokes on
    # fancy glyphs (see repo notes). Keep stdout portable.
    print("OnkoSygnal - knowledge base coverage\n")
    print(f"  sources ............ {len(kb.sources)}")
    print(f"  cancer sites ....... {len(kb.cancer_sites)}")
    print(f"  symptom patterns ... {len(kb.symptom_patterns)}")

    red = [p for p in kb.symptom_patterns if p.red_flag]
    print(f"    of which red-flag  {len(red)}")

    verified = [c for c in kb.cancer_sites if c.incidence.verified]
    print(f"  incidence verified . {len(verified)}/{len(kb.cancer_sites)}")

    print("\nSites (annual new cases, PL - SEED, verify against KRN):")
    for c in sorted(kb.cancer_sites, key=lambda x: -x.incidence.annual_new_cases_pl):
        mark = "[ok]" if c.incidence.verified else "[??]"
        n_patterns = sum(1 for p in kb.symptom_patterns if c.id in p.associated_site_ids)
        name = c.pl_name.encode("ascii", "replace").decode("ascii")
        print(
            f"  {mark} {name:<32} ~{c.incidence.annual_new_cases_pl:>6}/rok "
            f"({c.incidence.as_of_year})  | {n_patterns} symptom(s)"
        )

    orphan_sites = [
        c.id
        for c in kb.cancer_sites
        if not any(c.id in p.associated_site_ids for p in kb.symptom_patterns)
    ]
    if orphan_sites:
        print(f"\n  sites with no linked symptom pattern: {', '.join(orphan_sites)}")


if __name__ == "__main__":
    main()
