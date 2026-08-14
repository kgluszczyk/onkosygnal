"""Canonical data contract for OnkoSygnał. Pydantic v2 models are the source of truth;
JSON Schema for curation/extraction agents is exported by export_schema.py.

Design guardrails encoded here (see README "Why this scope"):
- There is NO probability/risk field anywhere. Guidance is categorical sign-posting only.
- Every content record references a Source in sources.json (provenance is mandatory).
- Incidence carries `verified`; unverified figures must not be presented as fact.
"""

from __future__ import annotations

from enum import Enum

from pydantic import BaseModel, ConfigDict, Field, model_validator

SLUG_PATTERN = r"^[a-z0-9]+(-[a-z0-9]+)*$"
# YYYY or YYYY-MM or YYYY-MM-DD
DATE_PATTERN = r"^\d{4}(-\d{2}(-\d{2})?)?$"


class Sex(str, Enum):
    all = "all"
    female = "female"
    male = "male"


class SourceKind(str, Enum):
    guideline = "guideline"          # e.g. NICE NG12
    registry = "registry"            # e.g. KRN / onkologia.org.pl
    portal = "portal"                # e.g. Narodowy Portal Onkologiczny
    regulation = "regulation"        # e.g. MZ rozporządzenie ws. karty DiLO
    other = "other"


class Source(BaseModel):
    """A citable provenance record. Every content claim points at one of these."""

    model_config = ConfigDict(extra="forbid")

    id: str = Field(pattern=SLUG_PATTERN)
    title: str
    publisher: str
    country: str = Field(description="ISO-ish country tag, e.g. 'PL' or 'UK'")
    kind: SourceKind
    url: str
    retrieved: str = Field(pattern=DATE_PATTERN, description="When last checked.")
    note: str | None = None


class Incidence(BaseModel):
    """Population incidence used ONLY as context ('how common in Poland'), never as a
    per-user risk. Seed values are approximate and must be verified against the KRN report."""

    model_config = ConfigDict(extra="forbid")

    annual_new_cases_pl: int = Field(ge=0)
    as_of_year: int = Field(ge=1990, le=2100)
    sex: Sex = Sex.all
    source_id: str = Field(pattern=SLUG_PATTERN)
    verified: bool = Field(
        default=False,
        description="True only once checked against the primary KRN figure. Unverified "
        "figures are flagged by validate.py and must not be shipped as fact.",
    )


class CancerSite(BaseModel):
    """A cancer site with Polish incidence context and official early-warning signs."""

    model_config = ConfigDict(extra="forbid")

    id: str = Field(pattern=SLUG_PATTERN)
    pl_name: str
    en_name: str | None = None
    incidence: Incidence
    early_signs_pl: list[str] = Field(
        default_factory=list,
        description="Official early/warning signs (Narodowy Portal Onkologiczny), verbatim-ish.",
    )
    early_signs_source_id: str = Field(pattern=SLUG_PATTERN)
    dilo_eligible: bool = Field(
        default=True,
        description="Whether suspicion of this cancer can open a DiLO fast-track card.",
    )
    notes_pl: str | None = None


class SymptomPattern(BaseModel):
    """A recognized symptom (optionally red-flag) that routes free-text input to guidance.

    NOTE: this is a RETRIEVAL key, not a risk model. `pl_terms` are the phrases a user might
    type; the matcher folds Polish diacritics and matches on these. Guidance is categorical."""

    model_config = ConfigDict(extra="forbid")

    id: str = Field(pattern=SLUG_PATTERN)
    pl_label: str = Field(description="Canonical Polish name of the symptom.")
    pl_terms: list[str] = Field(
        min_length=1, description="Lay-language aliases/phrasings a user might enter."
    )
    red_flag: bool = Field(
        description="Whether this is an alarm symptom warranting prompt POZ consultation."
    )
    associated_site_ids: list[str] = Field(default_factory=list)
    duration_context_pl: str | None = Field(
        default=None, description="e.g. 'utrzymujący się ponad 3 tygodnie'."
    )
    age_context_min: int | None = Field(
        default=None, ge=0, le=120, description="Age above which the red flag is emphasized."
    )
    guidance_pl: str = Field(description="Categorical sign-posting guidance. No probability.")
    caveat_pl: str | None = Field(
        default=None,
        description="Honest context, e.g. that most such symptoms are not cancer.",
    )
    source_id: str = Field(pattern=SLUG_PATTERN)


class DiloDeadline(BaseModel):
    model_config = ConfigDict(extra="forbid")

    stage_pl: str
    days: int = Field(ge=0)


class DiloInfo(BaseModel):
    """The DiLO fast-track oncology pathway module — the product differentiator."""

    model_config = ConfigDict(extra="forbid")

    intro_pl: str
    rights_pl: list[str] = Field(min_length=1)
    deadlines: list[DiloDeadline] = Field(default_factory=list)
    what_to_ask_pl: list[str] = Field(
        min_length=1, description="Concrete things to say/ask at the POZ appointment."
    )
    source_id: str = Field(pattern=SLUG_PATTERN)


class KnowledgeBase(BaseModel):
    """The whole curated KB, assembled from data/*.json for cross-reference validation."""

    model_config = ConfigDict(extra="forbid")

    sources: list[Source]
    cancer_sites: list[CancerSite]
    symptom_patterns: list[SymptomPattern]
    dilo: DiloInfo

    # --- cross-reference integrity -------------------------------------------------
    @model_validator(mode="after")
    def _check_refs(self) -> "KnowledgeBase":
        source_ids = {s.id for s in self.sources}
        site_ids = {c.id for c in self.cancer_sites}

        def require_source(ref: str, where: str) -> None:
            if ref not in source_ids:
                raise ValueError(f"{where} references unknown source_id '{ref}'")

        # unique ids
        for name, items in (
            ("sources", self.sources),
            ("cancer_sites", self.cancer_sites),
            ("symptom_patterns", self.symptom_patterns),
        ):
            ids = [i.id for i in items]
            dupes = {i for i in ids if ids.count(i) > 1}
            if dupes:
                raise ValueError(f"duplicate ids in {name}: {sorted(dupes)}")

        for c in self.cancer_sites:
            require_source(c.incidence.source_id, f"cancer_site '{c.id}'.incidence")
            require_source(c.early_signs_source_id, f"cancer_site '{c.id}'.early_signs")

        for p in self.symptom_patterns:
            require_source(p.source_id, f"symptom_pattern '{p.id}'")
            for sid in p.associated_site_ids:
                if sid not in site_ids:
                    raise ValueError(
                        f"symptom_pattern '{p.id}' references unknown cancer_site '{sid}'"
                    )

        require_source(self.dilo.source_id, "dilo")
        return self
