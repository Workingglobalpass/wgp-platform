-- ============================================================================
-- WGP One — Schema iniziale (Sprint 1)
-- Riferimento: AGENTS.md §10
--
-- Principi:
-- - Tutte le tabelle del brief, incluse housing_* e reviews (chiuse via RLS).
-- - pgcrypto per gen_random_uuid().
-- - RLS abilitata su TUTTE le tabelle; le policy vivono nel file 003.
-- - Trigger audit_log nel file 002.
-- - Seed pricing_plans + feature_flags nel file 004.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ============================================================================
-- ENUMS
-- ============================================================================

create type trust_level_t      as enum ('basic','professional','expert','trusted');
create type badge_level_t      as enum ('none','bronze','standard','silver','silver_plus','gold');
create type user_role_t        as enum ('worker','employer','reviewer','admin');
create type identity_status_t  as enum ('pending','verified','rejected');
create type identity_provider_t as enum ('manual','onfido','veriff','sumsub');
create type cefr_t             as enum ('a1','a2','b1','b2','c1','c2');
create type document_status_t  as enum ('pending','verified','rejected','expired');
create type matcher_level_t    as enum ('standard','advanced','professional','expert','master');
create type matcher_status_t   as enum ('in_progress','completed','invalidated');
create type interview_status_t as enum ('scheduled','completed','no_show');
create type review_decision_t  as enum ('approved','rejected','request_changes');
create type employer_plan_t    as enum ('free','pay_per_search','starter','business','enterprise');
create type job_status_t       as enum ('draft','published','closed','filled');
create type application_status_t as enum ('submitted','viewed','shortlisted','rejected','hired');
create type housing_type_t     as enum ('room','apartment','staff_housing');
create type housing_status_t   as enum ('available','reserved','rented','inactive');
create type housing_inquiry_status_t as enum ('submitted','contact_shared','viewed','rejected');
create type pricing_audience_t as enum ('worker','employer','both');

-- ============================================================================
-- PROFILES (1:1 con auth.users di Supabase)
-- ============================================================================

create table profiles (
  id                      uuid primary key references auth.users(id) on delete cascade,
  username                text unique,
  email                   text,
  phone                   text,
  language_main           text check (language_main in ('it','es','en','ca','fr','de','pt','ro')),
  trust_level             trust_level_t not null default 'basic',
  badge                   badge_level_t not null default 'none',
  verification_score      int not null default 0 check (verification_score between 0 and 100),
  -- IMPORTANT: extended_time_enabled = DSA/UE 2000/78. +50% tempo Matcher. Mai penalit\xC3\xA0.
  extended_time_enabled   boolean not null default false,
  -- IMPORTANT: photo_url \xC3\xA8 solo presentazione. Mai usata per scoring. Brief \xA716.11.
  photo_url               text,
  role                    user_role_t not null default 'worker',
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);
alter table profiles enable row level security;

-- ============================================================================
-- STEP 0 — IDENTITY VERIFICATION
-- ============================================================================

create table identity_verifications (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references profiles(id) on delete cascade,
  document_type       text check (document_type in ('DNI','NIE','passport','other')),
  document_image_url  text,
  selfie_url          text,
  liveness_video_url  text,
  status              identity_status_t not null default 'pending',
  reviewer_id         uuid references profiles(id),
  reviewer_notes      text,
  -- Fase A: 'manual'. Quando feature_flags.onfido_enabled=true, si passa a 'onfido'/'veriff'/'sumsub'.
  provider            identity_provider_t not null default 'manual',
  enhanced            boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
alter table identity_verifications enable row level security;
create index on identity_verifications (user_id);
create index on identity_verifications (status);

-- ============================================================================
-- STEP 2 — LINGUE CEFR
-- ============================================================================

create table languages (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references profiles(id) on delete cascade,
  lang_code               text not null check (lang_code in ('it','es','en','ca','fr','de','pt','ro')),
  cefr_speaking           cefr_t,
  cefr_writing            cefr_t,
  verified_by_matcher     boolean not null default false,
  verified_by_interview   boolean not null default false,
  created_at              timestamptz not null default now(),
  unique (user_id, lang_code)
);
alter table languages enable row level security;
create index on languages (user_id);

-- ============================================================================
-- STEP 3 — DOCUMENTI
-- ============================================================================

create table documents (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references profiles(id) on delete cascade,
  doc_type      text check (doc_type in ('contract','certificate','haccp','diploma','reference','other')),
  file_url      text not null,
  ocr_text      text,
  issued_date   date,
  expiry_date   date,
  status        document_status_t not null default 'pending',
  reviewer_id   uuid references profiles(id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
alter table documents enable row level security;
create index on documents (user_id);
create index on documents (status);

-- ============================================================================
-- STEP 4 — TGSS VIDA LABORAL
-- ============================================================================

create table tgss_records (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null references profiles(id) on delete cascade,
  pdf_url                  text not null,
  signature_valid          boolean,
  cea_code                 text,
  extracted_periods        jsonb,
  total_years_experience   numeric(5,2),
  created_at               timestamptz not null default now()
);
alter table tgss_records enable row level security;
create index on tgss_records (user_id);

-- ============================================================================
-- STEP 5 — MATCHER (CAT adattivo)
-- ============================================================================

-- Banca domande validate (min 2 revisori)
create table matcher_questions (
  id                  uuid primary key default gen_random_uuid(),
  role_id             text not null,         -- es. 'cuoco','cameriere','barman','receptionist','pizzaiolo'
  category            text not null default 'hospitality',
  language            text not null check (language in ('it','es','en','ca')),
  difficulty          numeric(3,2) not null check (difficulty between 1.0 and 3.0),
  text                text not null,
  options             jsonb not null,        -- [{label,text}]
  correct_option      int not null,
  time_limit_seconds  int not null default 90,
  validated_by        jsonb not null default '[]'::jsonb,  -- array reviewer_id
  active              boolean not null default true,
  created_at          timestamptz not null default now()
);
alter table matcher_questions enable row level security;
create index on matcher_questions (role_id, language, active);
create index on matcher_questions (difficulty);

create table matcher_sessions (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references profiles(id) on delete cascade,
  role_id             text not null,
  language            text not null check (language in ('it','es','en','ca')),
  level               matcher_level_t not null,
  num_questions       int not null,
  random_seed         bigint not null,
  current_difficulty  numeric(3,2) not null default 1.5,
  tab_switches        int not null default 0,
  status              matcher_status_t not null default 'in_progress',
  score_final         numeric(5,2),
  paid_amount_cents   int not null default 0,
  started_at          timestamptz not null default now(),
  completed_at        timestamptz
);
alter table matcher_sessions enable row level security;
create index on matcher_sessions (user_id);
create index on matcher_sessions (status);

create table matcher_responses (
  id                  uuid primary key default gen_random_uuid(),
  session_id          uuid not null references matcher_sessions(id) on delete cascade,
  question_id         uuid not null references matcher_questions(id),
  selected_option     int,
  is_correct          boolean,
  -- IMPORTANT: response_time_ms = profiling only. Mai usato come penalit\xC3\xA0 di scoring.
  -- Velocit\xC3\xA0 di scrittura/risposta NON pu\xC3\xB2 penalizzare. UE 2000/78 + brief \xA76.6.
  response_time_ms    int,
  anomaly_flag        boolean not null default false,
  -- Hook Phase 2 anti-cheating video (non usato in Fase A)
  response_video_url  text,
  created_at          timestamptz not null default now()
);
alter table matcher_responses enable row level security;
create index on matcher_responses (session_id);

-- ============================================================================
-- STEP 6 — VIDEO INTERVIEW (beta, opzionale)
-- ============================================================================

create table interviews (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references profiles(id) on delete cascade,
  daily_room_url      text,
  recording_url       text,
  -- IMPORTANT: ai_analysis contiene SOLO content analysis (technical_specificity,
  -- narrative_coherence, cross_skill). MAI biometria/espressioni/sguardo. AI Act Art. 5(1)(f).
  transcript          jsonb,
  ai_analysis         jsonb,
  duration_seconds    int,
  status              interview_status_t not null default 'scheduled',
  created_at          timestamptz not null default now()
);
alter table interviews enable row level security;
create index on interviews (user_id);

-- ============================================================================
-- STEP 7 — VALIDAZIONE UMANA (revisore senior firma Gold)
-- ============================================================================

create table reviews (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references profiles(id) on delete cascade,
  reviewer_id     uuid not null references profiles(id),
  decision        review_decision_t not null,
  badge_assigned  badge_level_t,
  notes           text,
  signed_at       timestamptz not null default now(),
  signature_hash  text not null
);
alter table reviews enable row level security;
create index on reviews (user_id);
create index on reviews (reviewer_id);

-- ============================================================================
-- BADGES EMESSI (con QR + verify URL pubblico)
-- ============================================================================

create table badges (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references profiles(id) on delete cascade,
  level         badge_level_t not null,
  eqf_level     int check (eqf_level between 2 and 7),
  qr_code_url   text,
  verify_url    text,
  issued_at     timestamptz not null default now(),
  expires_at    timestamptz,
  -- Hook blockchain Q4 2026. Per ora hash-chain Postgres-side (calcolato applicativo).
  -- Public claim = "Blockchain timestamping in development Q4 2026". Brief \xA716.4.
  hash_chain    text,
  reviewer_id   uuid references profiles(id),
  revoked       boolean not null default false
);
alter table badges enable row level security;
create index on badges (user_id);
create index on badges (level);

-- ============================================================================
-- JOBS MARKETPLACE
-- ============================================================================

create table employers (
  id                  uuid primary key references auth.users(id) on delete cascade,
  business_name       text not null,
  cif                 text,                  -- partita IVA spagnola
  city                text,
  address             text,
  contact_email       text,
  contact_phone       text,
  verified            boolean not null default false,
  plan                employer_plan_t not null default 'free',
  plan_active_until   timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
alter table employers enable row level security;

create table jobs (
  id                       uuid primary key default gen_random_uuid(),
  employer_id              uuid not null references employers(id) on delete cascade,
  role_id                  text not null,
  title                    text not null,
  description              text,
  language_required        text,
  cefr_required            cefr_t,
  min_verification_score   int not null default 0 check (min_verification_score between 0 and 100),
  salary_min_cents         int,
  salary_max_cents         int,
  currency                 text not null default 'EUR',
  contract_type            text check (contract_type in ('temporal','indefinido','seasonal','other')),
  -- Hook Housing (placeholder Fase A)
  housing_provided         boolean not null default false,
  city                     text,
  status                   job_status_t not null default 'draft',
  published_at             timestamptz,
  expires_at               timestamptz,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);
alter table jobs enable row level security;
create index on jobs (employer_id);
create index on jobs (status, published_at desc);
create index on jobs (city);

create table job_applications (
  id              uuid primary key default gen_random_uuid(),
  job_id          uuid not null references jobs(id) on delete cascade,
  worker_id       uuid not null references profiles(id) on delete cascade,
  cover_message   text,
  status          application_status_t not null default 'submitted',
  applied_at      timestamptz not null default now(),
  unique (job_id, worker_id)
);
alter table job_applications enable row level security;
create index on job_applications (job_id);
create index on job_applications (worker_id);

-- ============================================================================
-- HOUSING — schema pronto, RLS chiusa fino a settembre 2026 (brief \xA716.13)
-- ============================================================================

create table housing_units (
  id                       uuid primary key default gen_random_uuid(),
  owner_id                 uuid not null references profiles(id) on delete cascade,
  type                     housing_type_t not null,
  city                     text,
  address                  text,
  bedrooms                 int,
  bathrooms                int,
  monthly_rent_cents       int,
  available_from           date,
  available_to             date,
  min_verification_score   int not null default 75,
  description              text,
  photos                   jsonb,
  status                   housing_status_t not null default 'available',
  created_at               timestamptz not null default now()
);
alter table housing_units enable row level security;

create table housing_inquiries (
  id           uuid primary key default gen_random_uuid(),
  unit_id      uuid not null references housing_units(id) on delete cascade,
  worker_id    uuid not null references profiles(id) on delete cascade,
  message      text,
  status       housing_inquiry_status_t not null default 'submitted',
  applied_at   timestamptz not null default now()
);
alter table housing_inquiries enable row level security;

-- ============================================================================
-- PRICING DINAMICO (mai hardcoded — brief \xA716.2)
-- ============================================================================

create table pricing_plans (
  id          uuid primary key default gen_random_uuid(),
  name        text unique not null,
  audience    pricing_audience_t not null,
  price_cents int not null,
  currency    text not null default 'EUR',
  active      boolean not null default true,
  valid_from  timestamptz not null default now(),
  valid_to    timestamptz,
  notes       text,
  updated_at  timestamptz not null default now()
);
alter table pricing_plans enable row level security;
create index on pricing_plans (name, active);

-- ============================================================================
-- FEATURE FLAGS (mai feature attive senza flag — brief \xA716.3)
-- ============================================================================

create table feature_flags (
  key                 text primary key,
  enabled             boolean not null default false,
  rollout_percentage  int not null default 0 check (rollout_percentage between 0 and 100),
  notes               text,
  updated_at          timestamptz not null default now(),
  updated_by          uuid references profiles(id)
);
alter table feature_flags enable row level security;

-- ============================================================================
-- EVENTS / ANALYTICS (self-hosted backup di PostHog)
-- ============================================================================

create table events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references profiles(id) on delete set null,
  event_type  text not null,
  payload     jsonb not null default '{}'::jsonb,
  session_id  text,
  created_at  timestamptz not null default now()
);
alter table events enable row level security;
create index on events (event_type, created_at desc);
create index on events (user_id, created_at desc);

-- ============================================================================
-- AUDIT LOG (RGPD Art. 30 + AI Act tracciabilit\xC3\xA0)
-- Trigger nel file 002.
-- ============================================================================

create table audit_log (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references profiles(id) on delete set null,  -- soggetto interessato
  actor_id    uuid references profiles(id) on delete set null,  -- chi ha agito
  table_name  text not null,
  record_id   text not null,
  action      text not null check (action in ('insert','update','delete')),
  old_value   jsonb,
  new_value   jsonb,
  ip_address  text,
  user_agent  text,
  created_at  timestamptz not null default now()
);
alter table audit_log enable row level security;
create index on audit_log (table_name, record_id);
create index on audit_log (user_id, created_at desc);
create index on audit_log (actor_id, created_at desc);

-- ============================================================================
-- WAITLIST (Sprint 1 — landing page)
-- Non in \xA710 del brief: aggiunta su richiesta Sprint 1.
-- Campi language + role per segmentare i lead.
-- ============================================================================

create table waitlist (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  language    text check (language in ('it','es','en','ca')),
  role        text check (role in ('worker','employer')),
  source      text,   -- utm_source o canale (gestor\xC3\xADa, passaparola, ecc.)
  created_at  timestamptz not null default now()
);
alter table waitlist enable row level security;
create unique index waitlist_email_unique on waitlist (lower(email));

-- ============================================================================
-- updated_at trigger (helper)
-- ============================================================================

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at      before update on profiles                for each row execute function set_updated_at();
create trigger trg_identity_updated_at      before update on identity_verifications  for each row execute function set_updated_at();
create trigger trg_documents_updated_at     before update on documents               for each row execute function set_updated_at();
create trigger trg_employers_updated_at     before update on employers               for each row execute function set_updated_at();
create trigger trg_jobs_updated_at          before update on jobs                    for each row execute function set_updated_at();
create trigger trg_pricing_updated_at       before update on pricing_plans           for each row execute function set_updated_at();
create trigger trg_flags_updated_at         before update on feature_flags           for each row execute function set_updated_at();
