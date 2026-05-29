-- ============================================================================
-- WGP One — Migration 5: tabella `partners`
--
-- Canale "Partner" parallelo a `waitlist`. Soggetti diversi:
-- consulenti del lavoro, agenzie di recruiting/somministrazione, gestorías,
-- portali di recruiting che vogliono distribuire o integrare WGP.
--
-- Stile coerente con:
--  - 20260522000001_schema.sql       (CHECK inline, niente nuovo enum nel catalog)
--  - 20260522000002_audit_log_triggers.sql (uso del trigger log_audit_event)
--  - 20260522000003_rls_policies.sql (insert pubblico + accesso ristretto admin)
--
-- Non tocca la tabella `waitlist` né i suoi vincoli.
--
-- v2: aggiunto unique email + updated_at + colonna `stato` (pipeline commerciale).
-- ============================================================================

-- ============================================================================
-- TABELLA
-- ============================================================================

create table partners (
  id                uuid primary key default gen_random_uuid(),
  ragione_sociale   text not null,
  tipo_partner      text not null check (tipo_partner in (
                       'consulente_lavoro',
                       'agenzia_recruiting',
                       'agenzia_somministrazione',
                       'gestoria',
                       'portale_recruiting',
                       'altro'
                     )),
  territorio        text,
  p_iva             text,
  nome_contatto     text not null,
  email             text not null,
  telefono          text,
  sito_web          text,
  note              text,
  -- Pipeline commerciale: stato del lead lavorato dall'admin.
  -- Default 'nuovo' all'insert (il form non può sovrascrivere).
  stato             text not null default 'nuovo' check (stato in (
                       'nuovo',
                       'contattato',
                       'in_trattativa',
                       'chiuso'
                     )),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

alter table partners enable row level security;

-- ============================================================================
-- INDICI
--   - unique su lower(email): impedisce iscrizioni duplicate (stesso pattern
--     di waitlist_email_unique in _001).
--   - btree su tipo_partner per i filtri di dashboard.
-- ============================================================================

create unique index partners_email_unique on partners (lower(email));
create index on partners (tipo_partner);

-- ============================================================================
-- TRIGGER updated_at
-- Riusa la funzione set_updated_at() definita in _001.
-- ============================================================================

create trigger trg_partners_updated_at
  before update on partners
  for each row execute function set_updated_at();

-- ============================================================================
-- AUDIT TRIGGER
-- Riusa log_audit_event() definita in _002.
-- ============================================================================

create trigger trg_audit_partners
  after insert or update or delete on partners
  for each row execute function log_audit_event();

-- ============================================================================
-- RLS POLICIES
--
-- Pattern coerente con waitlist + esplicitazione UPDATE/DELETE come richiesto:
--   - INSERT: pubblico (form sito, anche da utenti non autenticati)
--   - SELECT: solo admin (via is_admin() definita in _003)
--   - UPDATE: solo admin (per lavorare i lead via dashboard)
--   - DELETE: solo admin
--
-- Il ruolo `service_role` bypassa SEMPRE la RLS — quindi le API server-side
-- con SUPABASE_SERVICE_ROLE_KEY hanno accesso completo (admin tools).
-- ============================================================================

create policy partners_insert_public
  on partners for insert to anon, authenticated
  with check (true);

create policy partners_select_admin
  on partners for select to authenticated
  using (is_admin());

create policy partners_update_admin
  on partners for update to authenticated
  using (is_admin())
  with check (is_admin());

create policy partners_delete_admin
  on partners for delete to authenticated
  using (is_admin());
