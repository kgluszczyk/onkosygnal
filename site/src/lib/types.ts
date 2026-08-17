// TypeScript mirror of the pydantic contract in pipeline/models.py.
// Keep in sync with that file (it is the source of truth).

export type Sex = 'all' | 'female' | 'male';
export type Urgency = 'emergency' | 'urgent' | 'routine';
export type SourceKind = 'guideline' | 'registry' | 'portal' | 'regulation' | 'other';

export interface Source {
  id: string;
  title: string;
  publisher: string;
  country: string;
  kind: SourceKind;
  url: string;
  retrieved: string;
  note?: string | null;
}

export interface Incidence {
  annual_new_cases_pl: number;
  as_of_year: number;
  sex: Sex;
  source_id: string;
  verified: boolean;
}

export interface CancerSite {
  id: string;
  pl_name: string;
  en_name?: string | null;
  incidence: Incidence;
  early_signs_pl: string[];
  early_signs_source_id: string;
  dilo_eligible: boolean;
  notes_pl?: string | null;
}

export interface SymptomPattern {
  id: string;
  pl_label: string;
  pl_terms: string[];
  red_flag: boolean;
  urgency: Urgency;
  associated_site_ids: string[];
  duration_context_pl?: string | null;
  age_context_min?: number | null;
  guidance_pl: string;
  caveat_pl?: string | null;
  source_id: string;
}

export interface ScreeningProgram {
  id: string;
  pl_name: string;
  sex: Sex;
  age_min: number;
  age_max: number;
  interval_years?: number | null;
  pl_description: string;
  booking_pl?: string | null;
  source_id: string;
}

export interface DiloDeadline {
  stage_pl: string;
  days: number;
}

export interface DiloInfo {
  intro_pl: string;
  rights_pl: string[];
  deadlines: DiloDeadline[];
  what_to_ask_pl: string[];
  source_id: string;
}
