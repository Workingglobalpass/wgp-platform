-- ============================================================================
-- WGP One — Audit log triggers
-- Riferimento: AGENTS.md §10 (tabella audit_log) + §14 (RGPD Art. 30 + AI Act).
--
-- Trigger generico AFTER INSERT/UPDATE/DELETE su tabelle sensibili.
-- L'autore (actor_id) è auth.uid() del session corrente.
-- Il soggetto interessato (user_id) viene derivato dal NEW/OLD record
-- se contiene una colonna user_id, altrimenti dal id del record stesso.
-- ============================================================================

create or replace function log_audit_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor    uuid;
  v_user     uuid;
  v_record   text;
  v_old      jsonb;
  v_new      jsonb;
begin
  -- chi ha agito = sessione Supabase corrente (può essere null per system writes)
  begin
    v_actor := auth.uid();
  exception when others then
    v_actor := null;
  end;

  if tg_op = 'DELETE' then
    v_old := to_jsonb(old);
    v_new := null;
    v_record := coalesce((v_old->>'id'), '');
    v_user := nullif(v_old->>'user_id','')::uuid;
  elsif tg_op = 'INSERT' then
    v_old := null;
    v_new := to_jsonb(new);
    v_record := coalesce((v_new->>'id'), '');
    v_user := nullif(v_new->>'user_id','')::uuid;
  else  -- UPDATE
    v_old := to_jsonb(old);
    v_new := to_jsonb(new);
    v_record := coalesce((v_new->>'id'), '');
    v_user := nullif(v_new->>'user_id','')::uuid;
  end if;

  -- Per tabelle dove l'id stesso è il soggetto (profiles, employers)
  if v_user is null then
    v_user := nullif(coalesce(v_new->>'id', v_old->>'id'),'')::uuid;
  end if;

  insert into audit_log (
    user_id, actor_id, table_name, record_id, action, old_value, new_value
  ) values (
    v_user, v_actor, tg_table_name, v_record, lower(tg_op), v_old, v_new
  );

  return coalesce(new, old);
end;
$$;

-- ============================================================================
-- Attaccare il trigger a TUTTE le tabelle sensibili.
-- (events e audit_log sono escluse per non generare loop.)
-- ============================================================================

create trigger trg_audit_profiles
  after insert or update or delete on profiles
  for each row execute function log_audit_event();

create trigger trg_audit_identity
  after insert or update or delete on identity_verifications
  for each row execute function log_audit_event();

create trigger trg_audit_languages
  after insert or update or delete on languages
  for each row execute function log_audit_event();

create trigger trg_audit_documents
  after insert or update or delete on documents
  for each row execute function log_audit_event();

create trigger trg_audit_tgss
  after insert or update or delete on tgss_records
  for each row execute function log_audit_event();

create trigger trg_audit_matcher_sessions
  after insert or update or delete on matcher_sessions
  for each row execute function log_audit_event();

create trigger trg_audit_matcher_responses
  after insert or update or delete on matcher_responses
  for each row execute function log_audit_event();

create trigger trg_audit_interviews
  after insert or update or delete on interviews
  for each row execute function log_audit_event();

create trigger trg_audit_reviews
  after insert or update or delete on reviews
  for each row execute function log_audit_event();

create trigger trg_audit_badges
  after insert or update or delete on badges
  for each row execute function log_audit_event();

create trigger trg_audit_employers
  after insert or update or delete on employers
  for each row execute function log_audit_event();

create trigger trg_audit_jobs
  after insert or update or delete on jobs
  for each row execute function log_audit_event();

create trigger trg_audit_applications
  after insert or update or delete on job_applications
  for each row execute function log_audit_event();

create trigger trg_audit_pricing
  after insert or update or delete on pricing_plans
  for each row execute function log_audit_event();

create trigger trg_audit_flags
  after insert or update or delete on feature_flags
  for each row execute function log_audit_event();

create trigger trg_audit_waitlist
  after insert or update or delete on waitlist
  for each row execute function log_audit_event();

-- Housing: predisposto. Attivare insieme al modulo settembre 2026.
create trigger trg_audit_housing_units
  after insert or update or delete on housing_units
  for each row execute function log_audit_event();

create trigger trg_audit_housing_inquiries
  after insert or update or delete on housing_inquiries
  for each row execute function log_audit_event();
