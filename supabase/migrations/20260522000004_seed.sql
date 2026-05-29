-- ============================================================================
-- WGP One — Seed iniziale
-- Riferimento: AGENTS.md §5 (pricing) + §12 (feature flags) + §15 (Sprint 1).
--
-- ATTENZIONE: i prezzi qui sono i valori RACCOMANDATI al lancio Menorca
-- (luglio 2026). Possono essere modificati live da /admin/pricing senza redeploy.
-- ============================================================================

-- ============================================================================
-- PRICING — prezzi in CENTESIMI (€1 = 100)
-- ============================================================================

insert into pricing_plans (name, audience, price_cents, currency, active, notes) values
  -- Lato lavoratore
  ('registration_base',        'worker',     0,    'EUR', true, 'Iscrizione + verifica identità base. Sempre gratis.'),
  ('step4_tgss_verification',  'worker',     0,    'EUR', true, 'Vida Laboral verificata. Sempre gratis.'),
  ('matcher_standard',         'worker',     0,    'EUR', true, 'Promo lancio: gratis. Prezzo target post-promo €5.'),
  ('matcher_professional',     'worker',     1500, 'EUR', true, '30 domande, target Silver+.'),
  ('matcher_master',           'worker',     3000, 'EUR', true, '80+ domande, target Gold.'),
  ('step0_enhanced_onfido',    'worker',     1000, 'EUR', true, 'Add-on biometrico Onfido/Veriff/Sumsub. Si attiva con feature flag onfido_enabled.'),
  ('step7_human_validation',   'worker',     2000, 'EUR', true, 'Revisore senior firma Gold. Obbligatorio per badge Gold ufficiale.'),
  ('combo_gold_complete',      'worker',     6000, 'EUR', true, 'Master + Onfido + Validazione umana (€30 + €10 + €20).'),

  -- Lato datore
  ('employer_free_trial',      'employer',   0,    'EUR', true, '30 giorni, max 3 candidati visibili.'),
  ('employer_pay_per_search',  'employer',   4900, 'EUR', true, '1 posizione, dossier completo su 3 candidati.'),
  ('employer_starter',         'employer',   14900,'EUR', true, '5 posizioni, dossier illimitati. Mensile.'),
  ('employer_business',        'employer',   34900,'EUR', true, 'Posizioni illimitate, dashboard team. Mensile.');

-- ============================================================================
-- FEATURE FLAGS — tutti spenti al lancio Fase A
-- ============================================================================

insert into feature_flags (key, enabled, rollout_percentage, notes) values
  ('onfido_enabled',                       false, 0, 'Step 0 Enhanced via Onfido. Attivare a ~200 utenti/mese.'),
  ('housing_visible',                      false, 0, 'Modulo Housing /housing. Attivare settembre 2026. RLS aprire con migrazione separata.'),
  ('reviews_enabled',                      false, 0, 'Recensioni datore↔lavoratore + Employer Trust Score. Attivare Q4 2026.'),
  ('volunteer_section',                    false, 0, 'Sezione volontariato /for-volunteers. Roadmap 2027.'),
  ('blockchain_anchor',                    false, 0, 'Ancoraggio blockchain badge. Attivare Q4 2026.'),
  ('video_interview_mandatory_for_gold',   false, 0, 'Fase A: opzionale anche per Gold (brief §0 + §2).'),
  ('cross_country_expansion',              false, 0, 'Italia/INPS + altri paesi UE. Fase B con CTO.'),
  ('matcher_advanced_visible',             false, 0, 'Livelli Advanced (20) ed Expert (50) Matcher. Fase A: nascosti.'),
  ('six_dimensions_visible',               false, 0, 'Brief §16.14: solo Professional al lancio. Mai mostrare le altre 5.'),
  ('employer_trust_score',                 false, 0, 'Score reputazionale datore. Q4 2026 quando ci sono dati.');
