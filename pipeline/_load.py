"""Shared loader: assemble the KnowledgeBase from data/*.json."""

from __future__ import annotations

import json
from pathlib import Path

from pipeline.models import KnowledgeBase

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"


def _read(name: str):
    return json.loads((DATA / name).read_text(encoding="utf-8"))


def load_kb() -> KnowledgeBase:
    """Load and fully validate (incl. cross-references) the curated knowledge base."""
    return KnowledgeBase.model_validate(
        {
            "sources": _read("sources.json"),
            "cancer_sites": _read("cancer_sites.json"),
            "symptom_patterns": _read("symptom_patterns.json"),
            "dilo": _read("dilo.json"),
        }
    )
