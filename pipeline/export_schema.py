"""Export JSON Schema from the pydantic models into schema/ for curation/extraction agents.

Run: uv run python -m pipeline.export_schema
"""

from __future__ import annotations

import json
from pathlib import Path

from pipeline.models import CancerSite, DiloInfo, ScreeningProgram, Source, SymptomPattern

ROOT = Path(__file__).resolve().parent.parent
SCHEMA = ROOT / "schema"

EXPORTS = {
    "source.schema.json": Source,
    "cancer-site.schema.json": CancerSite,
    "symptom-pattern.schema.json": SymptomPattern,
    "screening-program.schema.json": ScreeningProgram,
    "dilo.schema.json": DiloInfo,
}


def main() -> None:
    SCHEMA.mkdir(exist_ok=True)
    for filename, model in EXPORTS.items():
        schema = model.model_json_schema()
        (SCHEMA / filename).write_text(
            json.dumps(schema, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
        )
        print(f"[export_schema] wrote schema/{filename}")


if __name__ == "__main__":
    main()
