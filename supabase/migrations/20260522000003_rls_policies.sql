-- ============================================================================
-- WGP One — Row Level Security policies
-- Riferimento: AGENTS.md §10 (RLS obbligatoria) + §16 (regole hard).
--
-- Regole globali:
-- - Worker vede solo i propri dati.
-- - Employer vede solo i propri job + candidati che hanno applicato.
-- - Reviewer vede coda revisione.
-- - Admin vede tutto.
-- - Tabelle housing_* hanno RLS ON e ZERO policy = nessuno legge/scrive
--   (eccetto service role). Si apriranno quando feature_flags.housing_visible = true.
-- ============================================================================

-- ============================================================================
-- Helper: ruolo dell'utente corrente
-- ============================================================================

create or replace function current_role_name()
returns user_role_t
language sql
stable
security definer
set search_path = public
as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function is_admin()
returns boolean language sql stable as $$
  select current_role_name() = 'admin';
$$;

create or replace function is_reviewer()
returns boolean language sql stable as $$
  select current_role_name() in ('reviewer','admin');
$$;

create or replace function is_employer()
returns boolean language sql stable as $$
  select current_role_name() in ('employer','admin');
$$;

-- ============================================================================
-- PROFILES
-- ============================================================================

create policy profiles_select_own
  on profiles for select to authenticated
  using (id = auth.uid() or is_admin() or is_reviewer());

create policy profiles_update_own
  on profiles for update to authenticated
  using (id = auth.uid() or is_admin())
  with check (id = auth.uid() or is_admin());

create policy profiles_insert_self
  on profiles for insert to authenticated
  with check (id = auth.uid());

-- ============================================================================
-- IDENTITY VERIFICATIONS
-- ============================================================================

create policy identity_select_own_or_reviewer
  on identity_verifications for select to authenticated
  using (user_id = auth.uid() or is_reviewer());

create policy identity_insert_own
  on identity_verifications for insert to authenticated
  with check (user_id = auth.uid());

create policy identity_update_reviewer_or_admin
  on identity_verifications for update to authenticated
  using (is_reviewer())
  with check (is_reviewer());

-- ============================================================================
-- LANGUAGES / DOCUMENTS / TGSS — pattern "own + admin"
-- ============================================================================

create policy languages_select_own_or_admin
  on languages for select to authenticated
  using (user_id = auth.uid() or is_admin() or is_reviewer());
create policy languages_cud_own
  on languages for all to authenticated
  using (user_id = auth.uid() or is_admin())
  with check (user_id = auth.uid() or is_admin());

create policy documents_select_own_or_reviewer
  on documents for select to authenticated
  using (user_id = auth.uid() or is_reviewer());
create policy documents_insert_own
  on documents for insert to authenticated
  with check (user_id = auth.uid());
create policy documents_update_reviewer
  on documents for update to authenticated
  using (is_reviewer())
  with check (is_reviewer());

create policy tgss_select_own_or_reviewer
  on tgss_records for select to authenticated
  using (user_id = auth.uid() or is_reviewer());
create policy tgss_insert_own
  on tgss_records for insert to authenticated
  with check (user_id = auth.uid());
create policy tgss_update_reviewer
  on tgss_records for update to authenticated
  using (is_reviewer())
  with check (is_reviewer());

-- ============================================================================
-- MATCHER QUESTIONS — public catalog (solo active=true)
-- ============================================================================

create policy matcher_questions_select_active
  on matcher_questions for select to authenticated
  using (active = true or is_admin());

create policy matcher_questions_admin_write
  on matcher_questions for all to authenticated
  using (is_admin())
  with check (is_admin());

-- ============================================================================
-- MATCHER SESSIONS / RESPONSES
-- ============================================================================

create policy matcher_sessions_own
  on matcher_sessions for all to authenticated
  using (user_id = auth.uid() or is_admin() or is_reviewer())
  with check (user_id = auth.uid() or is_admin());

create policy matcher_responses_own_via_session
  on matcher_responses for all to authenticated
  using (
    exists (
      select 1 from matcher_sessions s
      where s.id = matcher_responses.session_id
        and (s.user_id = auth.uid() or is_admin() or is_reviewer())
    )
  )
  with check (
    exists (
      select 1 from matcher_sessions s
      where s.id = matcher_responses.session_id
        and (s.user_id = auth.uid() or is_admin())
    )
  );

-- ============================================================================
-- INTERVIEWS
-- ============================================================================

create policy interviews_own_or_reviewer
  on interviews for select to authenticated
  using (user_id = auth.uid() or is_reviewer());
create policy interviews_insert_own
  on interviews for insert to authenticated
  with check (user_id = auth.uid());
create policy interviews_update_reviewer
  on interviews for update to authenticated
  using (is_reviewer())
  with check (is_reviewer());

-- ============================================================================
-- REVIEWS (Step 7 — solo reviewer scrive; user può leggere la propria)
-- ============================================================================

create policy reviews_select_own_or_reviewer
  on reviews for select to authenticated
  using (user_id = auth.uid() or reviewer_id = auth.uid() or is_admin());

create policy reviews_insert_reviewer
  on reviews for insert to authenticated
  with check (is_reviewer() and reviewer_id = auth.uid());

create policy reviews_update_reviewer
  on reviews for update to authenticated
  using (reviewer_id = auth.uid() or is_admin())
  with check (reviewer_id = auth.uid() or is_admin());

-- ============================================================================
-- BADGES — verifica pubblica del badge tramite QR code
-- I badge non revocati sono leggibili da CHIUNQUE (anon + authenticated)
-- perché /badge/[id] è la verifica pubblica. Brief §3.
-- ============================================================================

create policy badges_public_verify
  on badges for select to anon, authenticated
  using (revoked = false);

create policy badges_admin_full
  on badges for all to authenticated
  using (is_admin())
  with check (is_admin());

-- ============================================================================
-- EMPLOYERS
-- ============================================================================

create policy employers_select_own_or_admin
  on employers for select to authenticated
  using (id = auth.uid() or is_admin());

create policy employers_insert_self
  on employers for insert to authenticated
  with check (id = auth.uid());

create policy employers_update_own_or_admin
  on employers for update to authenticated
  using (id = auth.uid() or is_admin())
  with check (id = auth.uid() or is_admin());

-- ============================================================================
-- JOBS — published leggibile da tutti gli authenticated
-- ============================================================================

create policy jobs_select_published_or_owner
  on jobs for select to authenticated
  using (
    status = 'published'
    or employer_id = auth.uid()
    or is_admin()
  );

create policy jobs_cud_owner_or_admin
  on jobs for all to authenticated
  using (employer_id = auth.uid() or is_admin())
  with check (employer_id = auth.uid() or is_admin());

-- ============================================================================
-- JOB APPLICATIONS
-- - worker vede le proprie applications
-- - employer vede solo le applications ai propri job
-- ============================================================================

create policy applications_select_worker_or_employer
  on job_applications for select to authenticated
  using (
    worker_id = auth.uid()
    or exists (
      select 1 from jobs j
      where j.id = job_applications.job_id and j.employer_id = auth.uid()
    )
    or is_admin()
  );

create policy applications_insert_worker
  on job_applications for insert to authenticated
  with check (worker_id = auth.uid());

create policy applications_update_employer_or_worker
  on job_applications for update to authenticated
  using (
    worker_id = auth.uid()
    or exists (
      select 1 from jobs j
      where j.id = job_applications.job_id and j.employer_id = auth.uid()
    )
    or is_admin()
  );

-- ============================================================================
-- HOUSING — RLS ON, ZERO policy = nessuno legge/scrive.
-- Le policy verranno aggiunte quando feature_flags.housing_visible = true
-- (settembre 2026). Brief §16.13.
-- ============================================================================

-- (intenzionalmente vuoto)

-- ============================================================================
-- PRICING — leggibile da tutti (anche anon, per landing). Solo admin scrive.
-- ============================================================================

create policy pricing_public_select_active
  on pricing_plans for select to anon, authenticated
  using (
    active = true
    and valid_from <= now()
    and (valid_to is null or valid_to >= now())
  );

create policy pricing_admin_write
  on pricing_plans for all to authenticated
  using (is_admin())
  with check (is_admin());

-- ============================================================================
-- FEATURE FLAGS — leggibili da authenticated, admin scrive
-- ============================================================================

create policy flags_select_all_authenticated
  on feature_flags for select to anon, authenticated
  using (true);

create policy flags_admin_write
  on feature_flags for all to authenticated
  using (is_admin())
  with check (is_admin());

-- ============================================================================
-- EVENTS — insert da chiunque autenticato (incluso anon via API), read admin
-- ============================================================================

create policy events_insert_any
  on events for insert to anon, authenticated
  with check (true);

create policy events_select_admin
  on events for select to authenticated
  using (is_admin());

-- ============================================================================
-- AUDIT LOG — read SOLO admin (insert tramite trigger SECURITY DEFINER)
-- ============================================================================

create policy audit_select_admin
  on audit_log for select to authenticated
  using (is_admin());

-- ============================================================================
-- WAITLIST — insert pubblico (landing), read solo admin
-- ============================================================================

create policy waitlist_insert_public
  on waitlist for insert to anon, authenticated
  with check (true);

create policy waitlist_select_admin
  on waitlist for select to authenticated
  using (is_admin());
