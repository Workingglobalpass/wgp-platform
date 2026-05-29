# WGP — Brief tecnico per Claude Code (v4 — MVP Lancio Pilota Menorca)

> Documento esecutivo per Claude Code. Costruzione MVP Fase A. Target lancio: **luglio 2026**.
> **Questo NON è il documento di visione**. Per la visione strategica completa, vedere `WGP_Vision_Completa_2026-2028.md`.
> Questo è solo cosa va costruito **adesso**, e cosa NON va costruito.

---

## 0. Fase del prodotto e principio guida

**Fase A = Lancio Pilota Menorca, giugno–agosto 2026.**

Target: **300-1000 lavoratori reali registrati + 3-10 datori hospitality + ~50-200 contratti attivati via piattaforma entro fine agosto 2026.**

**Principio guida — leggere prima di ogni decisione tecnica:**
> *Questo è un MVP per validare il modello. Deve essere sufficiente a reggere 1000 utenti UE con dati reali, ma NON deve essere production-grade definitivo. Quando il modello sarà validato dai dati (Q3-Q4 2026), un CTO con team dedicato rifarà la versione enterprise-grade. Il codice di oggi serve a essere modificato, sostituito, abbandonato. Privilegia semplicità, leggibilità, e modificabilità sopra perfezione architetturale.*

**Cosa significa concretamente:**
- Stack semplice e mainstream (Next.js + Supabase + Vercel — niente esotismi)
- Niente lock-in proprietari, niente architetture esoteriche
- Codice pulito ma **non over-engineered**
- Tutto il pricing e le feature critiche dietro **flag DB modificabili senza redeploy**
- Compliance UE minima ma solida (DPIA firmata, privacy notice, audit log)
- Niente compliance "stile multinazionale" (no marcatura CE, no registrazione UE AI Act database — queste arrivano in Fase B con il CTO)

---

## 1. Identità del prodotto al lancio

**WorkingGlobalPass (WGP)** = sistema di **certificazione professionale verificata** per lavoratori stagionali, in partenza dall'hospitality di Menorca.

**Tagline pubblica al lancio:**
> *"Lavora verificato. A Menorca e oltre."* / *"Verified work for the seasonal workforce."*

**Nomenclatura interna (cascata):**
| Livello | Nome |
|---------|------|
| Company | WorkingGlobalPass Tech S.L.U. |
| Sistema di onboarding+certificazione | **WGP One** |
| Esame adattivo | **WGP Matcher** |
| Output certificato (mappato EQF) | **Badge WGP** (Bronze/Std/Silver/Silver+/Gold) |
| UX commerciale (asse pricing) | **Trust Levels** (Basic/Pro/Expert/Trusted) |
| Punteggio visibile a tutti | **Verification Score %** |

**Mercato Fase A:** solo **hospitality Menorca**. Le altre categorie (costruzioni, salute, domestici, real estate, ecc.) esistono nello schema dati ma sono spente al lancio.
**Lingue Fase A:** Italiano, Español, English, Català.

**Cosa NON è il MVP Fase A** (importante perché altrimenti lo scope esplode):
- ❌ Modulo Housing/Alloggi → schema dati predisposto, UI "Coming September 2026"
- ❌ Recensioni datore↔lavoratore / Employer Trust Score → schema predisposto, feature spenta
- ❌ Modulo Volontariato/ONG → roadmap 2027
- ❌ Italia / INPS / altri paesi UE
- ❌ Blockchain timestamping → roadmap Q4 2026
- ❌ Video-intervista IA Step 6 → opzionale, in beta, non bloccante per Gold
- ❌ Le 6 dimensioni complete → al lancio solo dimensione **Professional**
- ❌ Marcatura CE / registrazione UE AI Act → Fase B

---

## 2. Architettura WGP One — i 7 step

Ogni step è opzionale tranne 0+1. Ogni step alza il Verification Score.

| Step | Nome | Obbligatorio | Verification Score sbloccato |
|------|------|--------------|------------------------------|
| 0 | Pre-iscrizione: documento + selfie + video liveness | Sì | +15% |
| 1 | Iscrizione base (email verificata + SMS-OTP) | Sì | inclusa in Step 0 |
| 2 | Profilo linguistico CEFR (auto-dichiarazione A1-C2) | Opzionale | +5% |
| 3 | Documenti lavorativi (contratti, certificati, HACCP) | Opzionale | +10% |
| 4 | Vida Laboral TGSS (upload manuale + verifica firma) | Opzionale | +20% (sblocca Bronze) |
| 5 | **WGP Matcher** (CAT adattivo 10/30/80 domande) | Opzionale | +20-30% (in base a livello) |
| 6 | Video-intervista IA (beta — opzionale anche per Gold in Fase A) | Opzionale | +10% |
| 7 | **Validazione UMANA finale** da revisore WGP | Sì per Gold | +10% (sblocca Gold) |

**Score massimo Fase A senza Step 6: 90%.** Per arrivare al 100% serve Step 6 video. Questo è di proposito: alza il valore percepito di Gold completo + spinge gli utenti motivati a fare la videointervista.

### Dashboard utente — messaggio sempre visibile

> *"Verification Score: 35%. Lavoratori al 75%+ ricevono in media 4× più offerte di lavoro a Menorca. Completa il prossimo step per salire."*

---

## 3. Sistema dei Badge WGP (asse certificazione esterna)

| Score | Badge | EQF |
|-------|-------|-----|
| 15-30% | Iscritto (no badge) | — |
| 30-49% | WGP Bronze | EQF 2-3 |
| 50-64% | WGP Standard | EQF 3-4 |
| 65-74% | WGP Silver | EQF 4-5 |
| 75-89% | WGP Silver+ | EQF 5-6 |
| 90-100% | **WGP Gold ⭐** | EQF 6-7 |

Ogni badge ha **ID univoco + QR code → URL pubblico di verifica**. Hash-chain su Postgres per ora (no blockchain). Materiali pubblici scrivono: *"Blockchain timestamping in development — Q4 2026"*. Mai come funzionalità attiva oggi.

---

## 4. Trust Levels (asse UX commerciale)

| Trust Level | Cosa verifica | Step richiesti |
|-------------|---------------|----------------|
| **Basic** | Identità documentale | 0+1 |
| **Professional** | + Vida Laboral verificata | 0+1+4 |
| **Expert** | + Matcher + (opzionale) video | 0+1+4+5 (+6) |
| **Trusted** | + storico contratti + valutazioni positive | min 6 mesi attivi |

---

## 5. Pricing Fase A (modificabile dal pannello admin)

> **Principio architetturale fondamentale:** TUTTI i prezzi vivono nella tabella Supabase `pricing_plans`, MAI hardcoded nel codice. L'admin può modificarli in 30 secondi senza redeploy.

### Prezzi raccomandati per il lancio Menorca (luglio 2026)

| Cosa | Prezzo | Note |
|------|--------|------|
| Iscrizione + verifica identità base | Gratis | Sempre |
| Step 4 Vida Laboral verificata | Gratis | Sempre |
| **Step 5 Matcher Standard** (10 domande) | **Gratis** (promo lancio) | Poi €5 |
| **Step 5 Matcher Professional** (30 domande) | **€15** | |
| **Step 5 Matcher Master** (80+ domande) | **€30** | |
| **Step 0 Enhanced — Onfido verifica biometrica** | **+€10** add-on | Opzionale, sblocca top tier identità |
| **Step 7 Validazione umana** (revisore senior firma Gold) | **€20** add-on | Obbligatorio per Gold ufficiale |
| **Combo Gold completo** | **€60** | €30 + €10 + €20 |

### Pricing datore (modificabile)

| Piano | Prezzo | Cosa include |
|-------|--------|-------------|
| Free Trial | Gratis | 30 giorni, max 3 candidati visibili |
| Pay-per-search | €49 | 1 posizione, dossier completo su 3 candidati |
| Starter | €149/mese | 5 posizioni, dossier illimitati |
| Business | €349/mese | Posizioni illimitate, dashboard team |

**Possibilità "datore paga per il lavoratore":** il datore può regalare l'upgrade WGP a un candidato promettente (Step 5/6/7 + Onfido). Genera fidelizzazione.

---

## 6. WGP Matcher — specifica di build

### 6.1 Scelta del livello d'impegno

| Livello | Domande | Tempo | Badge target |
|---------|---------|-------|--------------|
| Standard | 10 | ~15 min | Silver |
| Professional | 30 | ~45 min | Silver+ |
| Master | 80+ | ~2 ore | **Gold** ⭐ |

(Advanced 20 ed Expert 50 sono presenti nello schema dati ma non esposti in UI alla Fase A per semplificare.)

### 6.2 Banca domande Fase A

Pool iniziale al lancio: **500 domande validate**, suddivise:
- 5 ruoli hospitality core (cuoco, cameriere, barman, receptionist, pizzaiolo)
- × 4 lingue (it/es/en/ca)
- × 25 domande per combinazione

Generate via Claude API, validate da almeno 2 revisori (es. Massimo + un altro pro hospitality), salvate in `matcher_questions` su Supabase.

### 6.3 CAT — Computerized Adaptive Testing

Risposta corretta → prossima domanda sale di difficoltà. Errata → scende. Implementazione stub Fase A: 3 livelli di difficoltà (1-2-3). IRT semplificata, non Item Response Theory completa.

**Principio non negoziabile:** se l'utente sbaglia continuamente, il sistema scende fino a domande basilari. **L'obiettivo non è bocciare, è misurare.**

### 6.4 Timer per domanda (anti-cheating attivo)

Ogni domanda ha `time_limit_seconds` (default 90, configurabile per categoria).

**Accomodamento DSA OBBLIGATORIO.** Utente con `extended_time_enabled = true` riceve **+50% di tempo** automaticamente. Attivabile in fase di registrazione. *Coerente con Direttiva UE 2000/78.*

### 6.5 Anti-cheating: detection cambio finestra

```javascript
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // log su matcher_sessions.tab_switches++
    // mostra warning visibile
  }
});
window.addEventListener('blur', /* idem */);

// Soglia: dopo 3 violazioni → sessione invalidata, ripresentata con domande nuove
```

**Messaggio all'utente:**
> *"Hai lasciato la pagina del test. Non è possibile consultare altre fonti durante l'esame WGP. Hai N segnalazioni su 3. Dopo la terza, la sessione verrà invalidata."*

**Importante:** questo NON è AI Act ad alto rischio. È solo monitoraggio di interazione con la pagina, identico a Microsoft Certification, AWS, Examity, ecc.

### 6.6 Anti-discriminazione — principio non negoziabile

**La velocità di scrittura NON è MAI metrica di scoring.** Commentare esplicitamente nel codice:

```typescript
// IMPORTANT: writing speed is NEVER a scoring penalty.
// Profiling info only, never penalty. See EU Directive 2000/78.
// Source: WGP_Architettura.docx §5.5 + brief v4 §6.6.
```

---

## 7. Step 0 Identity Verification — modalità Fase A

**MVP Fase A:** verifica con **revisore umano manuale** (tu o un assistente part-time, costo €500-800/mese, sostenibile fino a ~200-300 utenti/mese).

**Step 0 Enhanced (+€10):** integrazione **Onfido** o **Veriff** o **Sumsub**. Attivabile dal flag `feature_flags.onfido_enabled = true` quando il volume lo giustifica.

Schema dati e UI predisposti dal giorno 1. Si accende l'integrazione cambiando un env var.

---

## 8. Step 7 — Validazione umana finale

**Mai e poi mai un badge Gold viene emesso senza decisione umana firmata.**

**Fase A:** revisori = 2-3 persone fidate (tu, Massimo, un altro hospitality senior). Compenso €15-25 a dossier validato. Coda di revisione in `/admin/reviewer`.

**Profilo revisore (formalizzazione Fase B):** 10+ anni esperienza categoria, codice deontologico firmato, audit periodico.

---

## 9. Stack tecnico

### Confermato (da `package.json` esistente)
- Next.js 16.2.6 (App Router) — leggere `node_modules/next/dist/docs/` prima di assumere convenzioni vecchie
- React 19.2.4
- TypeScript 5
- Tailwind CSS 4

### Da aggiungere
- `@anthropic-ai/sdk` (server-side ONLY)
- **Supabase** (Postgres + Auth + Storage + Realtime) — istanza Frankfurt (RGPD)
- `shadcn/ui` per componenti
- `react-hook-form` + `zod` per validazione
- `lucide-react` per icone
- `posthog-js` per analytics (5 metriche chiave — vedi §13)

### Brand colors (palette Navy Fintech — UFFICIALE da LinkedIn 17/05/2026)

```css
--wgp-navy:        #0A1F44;  /* primary, headers */
--wgp-electric:    #0066FF;  /* CTA, link, badge highlight */
--wgp-white:       #FFFFFF;
--wgp-grey-text:   #6E7D91;
```

Reference visiva: Stripe, Plaid, Revolut, N26, Linear. **NON usare teal/gold.**

### Struttura cartelle target

```
src/app/
├── page.tsx                          Landing pubblica (vision completa, prodotto verifica live)
├── (public)/
│   ├── about/page.tsx
│   ├── for-workers/page.tsx
│   ├── for-employers/page.tsx
│   ├── for-housing/page.tsx          "Coming September 2026" — preview
│   └── for-volunteers/page.tsx       "Coming 2027" — preview
├── one/                              WGP One — flusso onboarding
│   ├── verifica-identita/page.tsx    Step 0
│   ├── iscrizione/page.tsx           Step 1
│   ├── cefr/page.tsx                 Step 2
│   ├── documenti/page.tsx            Step 3
│   ├── tgss/page.tsx                 Step 4
│   ├── matcher/page.tsx              Step 5
│   └── intervista/page.tsx           Step 6 (beta)
├── dashboard/page.tsx                Verification Score + progress + offerte
├── jobs/                             Marketplace Jobs
│   ├── page.tsx                      Lista offerte
│   ├── [id]/page.tsx                 Dettaglio offerta
│   └── post/page.tsx                 Datore pubblica
├── housing/page.tsx                  "Coming September 2026" placeholder
├── badge/[id]/page.tsx               Verifica pubblica badge via QR
├── admin/
│   ├── reviewer/page.tsx             Coda Step 7
│   ├── pricing/page.tsx              Modifica prezzi live
│   ├── flags/page.tsx                Feature flags toggle
│   └── analytics/page.tsx            5 metriche chiave
└── api/
    ├── chat/route.ts                 Anthropic API server-side
    ├── transcribe/route.ts           Whisper Step 6
    ├── ocr/route.ts                  Validazione documenti
    └── score/route.ts                Calcolo Verification Score

src/lib/
├── supabase/{client,server}.ts
├── matcher/
│   ├── cat-engine.ts                 CAT semplificato
│   ├── question-pool.ts              Random seed
│   └── anti-cheating.ts              visibilitychange + blur
├── pricing/get-price.ts              Sempre da DB, mai hardcoded
├── flags/get-flag.ts                 Feature flag lookup
└── data/roles.json                   Catalogo ruoli hospitality

src/components/
└── ui/                               shadcn
```

### Variabili d'ambiente

```bash
ANTHROPIC_API_KEY                  # server-side only
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY          # server-side only
DAILY_API_KEY                      # Step 6 (può essere vuota in Fase A)
ONFIDO_API_KEY                     # vuota finché feature flag spento
NEXT_PUBLIC_POSTHOG_KEY            # analytics
```

---

## 10. Schema dati Supabase

```sql
-- ============ PROFILI E AUTH ============

profiles
  id uuid PK FK auth.users
  username text UNIQUE
  email text, phone text
  language_main text  -- it/es/en/ca
  trust_level enum('basic','professional','expert','trusted') DEFAULT 'basic'
  badge enum('none','bronze','standard','silver','silver_plus','gold') DEFAULT 'none'
  verification_score int DEFAULT 0  -- 0-100, calcolato server-side
  extended_time_enabled bool DEFAULT false  -- DSA accomodamento
  photo_url text NULL  -- opzionale sempre, non incide su score
  role text DEFAULT 'worker'  -- worker / employer / reviewer / admin
  created_at, updated_at

-- ============ STEP 0 ============

identity_verifications
  id, user_id FK
  document_type text  -- DNI/NIE/passport
  document_image_url text
  selfie_url text, liveness_video_url text
  status enum('pending','verified','rejected')
  reviewer_id FK NULL  -- chi ha validato manualmente
  reviewer_notes text
  provider enum('manual','onfido','veriff','sumsub')  -- 'manual' è default Fase A
  enhanced bool DEFAULT false  -- true se +€10 Onfido

-- ============ STEP 2 LINGUE ============

languages
  id, user_id FK
  lang_code  -- it/es/en/ca/fr/de/pt/ro
  cefr_speaking enum('a1','a2','b1','b2','c1','c2')
  cefr_writing enum('a1','a2','b1','b2','c1','c2')
  verified_by_matcher bool DEFAULT false
  verified_by_interview bool DEFAULT false

-- ============ STEP 3 DOCUMENTI ============

documents
  id, user_id FK
  doc_type  -- contract/certificate/haccp/diploma/reference
  file_url text
  ocr_text text
  issued_date date, expiry_date date
  status enum('pending','verified','rejected','expired')
  reviewer_id FK NULL

-- ============ STEP 4 VIDA LABORAL ============

tgss_records
  id, user_id FK
  pdf_url text
  signature_valid bool
  cea_code text
  extracted_periods jsonb  -- [{start,end,cnae,employer,role}]
  total_years_experience numeric
  created_at

-- ============ STEP 5 MATCHER ============

matcher_questions
  id, role_id text FK
  category text  -- hospitality/construction/...
  language text
  difficulty numeric  -- 1.0 facile, 3.0 difficile (IRT b-parameter)
  text text
  options jsonb  -- [{label,text}]
  correct_option int
  time_limit_seconds int DEFAULT 90
  validated_by jsonb  -- array reviewer_ids (min 2 per validare)
  active bool DEFAULT true

matcher_sessions
  id uuid, user_id FK
  role_id FK
  language text
  level enum('standard','advanced','professional','expert','master')
  num_questions int
  random_seed bigint
  current_difficulty numeric
  tab_switches int DEFAULT 0
  status enum('in_progress','completed','invalidated')
  score_final numeric
  paid_amount_cents int  -- registra quanto pagato per questa sessione
  started_at, completed_at

matcher_responses
  id, session_id FK, question_id FK
  selected_option int
  is_correct bool
  response_time_ms int
  anomaly_flag bool DEFAULT false  -- es. risposta in <3s su domanda difficile
  response_video_url text NULL  -- HOOK Phase 2 anti-cheating video
  created_at

-- ============ STEP 6 VIDEO ============

interviews
  id, user_id FK
  daily_room_url text
  recording_url text
  transcript jsonb  -- Whisper timestamps
  ai_analysis jsonb  -- {technical_specificity, narrative_coherence, cross_skill[]}
  duration_seconds int
  status enum('scheduled','completed','no_show')

-- ============ STEP 7 VALIDAZIONE UMANA ============

reviews
  id, user_id FK, reviewer_id FK
  decision enum('approved','rejected','request_changes')
  badge_assigned enum('bronze','standard','silver','silver_plus','gold')
  notes text
  signed_at, signature_hash text

-- ============ BADGE EMESSI ============

badges
  id uuid, user_id FK
  level enum('bronze','standard','silver','silver_plus','gold')
  eqf_level int  -- 2..7
  qr_code_url text, verify_url text
  issued_at, expires_at
  hash_chain text  -- hook per blockchain Q4 2026
  reviewer_id FK
  revoked bool DEFAULT false  -- per gestione casi gravi

-- ============ JOBS MARKETPLACE ============

employers
  id uuid PK FK auth.users
  business_name text
  cif text  -- partita iva spagnola
  city text, address text
  contact_email, contact_phone
  verified bool DEFAULT false  -- Fase A: verifica manuale
  plan enum('free','pay_per_search','starter','business','enterprise')
  plan_active_until timestamp

jobs
  id uuid, employer_id FK
  role_id FK
  title text, description text
  language_required text
  cefr_required enum NULL
  min_verification_score int DEFAULT 0  -- filtro Score minimo
  salary_min_cents int, salary_max_cents int, currency text
  contract_type text  -- temporal/indefinido/seasonal
  housing_provided bool DEFAULT false  -- HOOK Housing (placeholder)
  city text
  status enum('draft','published','closed','filled')
  published_at, expires_at

job_applications
  id, job_id FK, worker_id FK
  cover_message text
  status enum('submitted','viewed','shortlisted','rejected','hired')
  applied_at

-- ============ HOUSING (HOOK SETTEMBRE 2026 — SCHEMA PRONTO) ============

housing_units  -- tabella pronta, route /housing in "coming soon"
  id, owner_id FK
  type text  -- room/apartment/staff_housing
  city, address text
  bedrooms int, bathrooms int
  monthly_rent_cents int
  available_from, available_to
  min_verification_score int DEFAULT 75  -- soglia accesso
  description text
  photos jsonb
  status enum('available','reserved','rented','inactive')

housing_inquiries  -- pronta, feature spenta
  id, unit_id FK, worker_id FK
  message text
  status enum('submitted','contact_shared','viewed','rejected')
  applied_at

-- ============ PRICING DINAMICO ============

pricing_plans
  id, name text  -- 'matcher_standard'/'matcher_pro'/'matcher_master'/'onfido_addon'/...
  audience enum('worker','employer','both')
  price_cents int
  currency text DEFAULT 'EUR'
  active bool DEFAULT true
  valid_from, valid_to timestamp
  notes text

-- ============ FEATURE FLAGS ============

feature_flags
  key text PK  -- 'onfido_enabled'/'housing_visible'/'reviews_enabled'/...
  enabled bool DEFAULT false
  rollout_percentage int DEFAULT 0  -- per gradual rollout
  notes text
  updated_at, updated_by FK

-- ============ EVENTS / ANALYTICS ============

events
  id, user_id FK NULL
  event_type text  -- 'step_completed'/'matcher_started'/'job_applied'/'payment_succeeded'/...
  payload jsonb
  session_id text
  created_at

-- ============ AUDIT LOG (RGPD Art. 30 + AI Act tracciabilità) ============

audit_log
  id, user_id FK NULL, actor_id FK  -- chi ha fatto l'azione
  table_name text, record_id text
  action text  -- create/update/delete/view
  old_value jsonb NULL, new_value jsonb NULL
  ip_address text, user_agent text
  created_at
  -- trigger Postgres su ogni INSERT/UPDATE/DELETE sulle tabelle sensibili
```

**Row Level Security obbligatoria** su tutte le tabelle. Worker vede solo i propri dati. Employer vede solo i propri job + candidati che hanno applicato. Reviewer vede coda revisione. Admin vede tutto.

---

## 11. Pricing modificabile dal pannello admin

`/admin/pricing` mostra una tabella di tutti i `pricing_plans` con colonna prezzo modificabile inline. Cambia il prezzo → salva → effetto immediato sul sito senza redeploy.

```typescript
// src/lib/pricing/get-price.ts
export async function getPrice(planName: string): Promise<number> {
  const { data } = await supabase
    .from('pricing_plans')
    .select('price_cents')
    .eq('name', planName)
    .eq('active', true)
    .lte('valid_from', new Date().toISOString())
    .or(`valid_to.is.null,valid_to.gte.${new Date().toISOString()}`)
    .single();
  return data?.price_cents ?? 0;
}
```

**Mai hardcoded.** Sempre `getPrice('matcher_standard')`, mai `const STANDARD = 500`.

---

## 12. Feature flags

`/admin/flags` con toggle on/off per ogni feature.

Flag iniziali Fase A:

```sql
INSERT INTO feature_flags (key, enabled, notes) VALUES
  ('onfido_enabled', false, 'Onfido integrazione - attivare a ~200 utenti/mese'),
  ('housing_visible', false, 'Modulo Housing - attivare settembre 2026'),
  ('reviews_enabled', false, 'Recensioni datore↔lavoratore - attivare Q4 2026'),
  ('volunteer_section', false, 'Sezione volontariato - roadmap 2027'),
  ('blockchain_anchor', false, 'Ancoraggio blockchain badge - Q4 2026'),
  ('video_interview_mandatory_for_gold', false, 'Fase A: opzionale'),
  ('cross_country_expansion', false, 'Italia/INPS - Fase B');
```

```typescript
// src/lib/flags/get-flag.ts
export async function isEnabled(key: string): Promise<boolean> {
  const { data } = await supabase.from('feature_flags').select('enabled').eq('key', key).single();
  return data?.enabled ?? false;
}
```

Nel codice:
```typescript
if (await isEnabled('housing_visible')) { /* mostra sezione */ }
```

---

## 13. Analytics — le 5 metriche chiave (dal giorno 1)

Ogni evento utente salva una riga su `events`. Dashboard `/admin/analytics` calcola in tempo reale:

1. **Worker acquisition rate**: iscritti/settimana, breakdown per canale (gestoría / passaparola / HACCP / SEO / paid)
2. **Completion funnel**: % che passa da Step 0→1→2→3→4→5→6→7
3. **Employer engagement**: # datori attivi/settimana, # ricerche, # candidati contattati, # assunzioni
4. **Willingness to pay signals**: # utenti che cliccano "Sblocca €15" senza completare il pagamento, # che completano
5. **Retention 30/60/90 giorni**: % utenti che tornano

Implementazione: PostHog (€0 fino a 1M eventi/mese) + dashboard custom in `/admin/analytics` per le 5 metriche aggregate.

---

## 14. Compliance — vincoli minimi MVP Fase A

### RGPD
- Privacy notice firmata da Conversia, pubblicata su /privacy
- DPIA scritta (Pau di Conversia) — **obbligatoria prima del lancio**
- Consenso esplicito granulare a ogni step
- Diritto all'oblio: utente cancella account → soft delete + cancellazione fisica dopo 30 gg
- Portabilità: export JSON del dossier
- Audit log (tabella `audit_log` con trigger Postgres)

### AI Act (livello minimo)
- Trasparenza: l'utente sa di interagire con sistema IA. Page `/ai-transparency` spiega logica generale.
- Validazione umana significativa: Step 7 obbligatorio per Gold, non aggirabile
- Tracciabilità: audit log
- *NON serve in Fase A:* marcatura CE, registrazione UE database alto rischio (Fase B)

### Direttiva 2000/78 anti-discriminazione
- Velocità scrittura mai usata come penalità (commentato nel codice)
- Accomodamento DSA: tempo esteso +50% opzionale
- Matcher multilingua

### Footer obbligatorio
> *© 2026 WorkingGlobalPass Tech S.L.U. — marchio registrato EUIPO 019351983*

---

## 15. Roadmap di build — 8 settimane

### Sprint 1 (settimana 1-2): fondamenta
1. Setup Supabase Frankfurt + schema completo (incluso housing/reviews vuoti) + RLS
2. Auth Supabase (email/password + magic link + SMS-OTP)
3. Landing pubblica con palette navy fintech + CTA waitlist + sezioni preview (housing/volunteers "coming soon")
4. Layout + design system (Tailwind + shadcn + brand colors)
5. i18n setup (it/es/en/ca)
6. **PostHog + tabella `events` + `audit_log` con trigger**
7. **Tabelle `pricing_plans` e `feature_flags` con seed iniziali**
8. Pagine `/privacy`, `/terms`, `/ai-transparency` (placeholders da finalizzare con Conversia)

### Sprint 2 (settimana 3-4): Step 0+1 + dashboard
9. `/one/iscrizione` Step 1 completo
10. `/one/verifica-identita` Step 0 con modalità **revisore manuale** (Onfido predisposto ma flag off)
11. Dashboard utente con Verification Score + progress bar 7 step
12. Pagamenti Stripe (in modalità test) — schema `payments` table
13. Emissione automatica Trust Level Basic + Score 15%

### Sprint 3 (settimana 5-6): Step 5 Matcher (core del prodotto)
14. Importare/riscrivere logica `wgp-matcher` in `/one/matcher`
15. Persistenza sessione + ripresa
16. CAT semplificato (3 livelli difficoltà)
17. **Timer per domanda + accomodamento DSA**
18. **Anti-cheating visibilitychange + blur + invalidation a 3 violazioni**
19. **Pool iniziale 500 domande** (generate via Claude API, salvate, validate da 2 revisori)
20. Pagamento Matcher Pro €15 / Master €30 (da `pricing_plans`)
21. Update Verification Score post-completion

### Sprint 4 (settimana 7-8): Step 2-3-4 + Jobs + Admin
22. CEFR self-assessment Step 2
23. Step 3 upload documenti + OCR base
24. `/one/tgss` upload Vida Laboral + verifica firma digitale
25. **Trust Level Professional sbloccabile**
26. **`/jobs` marketplace base** (lista, dettaglio, applicazione, filtro min_verification_score)
27. **`/admin/reviewer` coda Step 7** con UI di approvazione/rifiuto + firma
28. **`/admin/pricing` modifica prezzi inline**
29. **`/admin/flags` toggle feature**
30. **`/admin/analytics` con le 5 metriche**
31. Emissione badge con QR code + verify URL pubblico `/badge/[id]`
32. Step 6 video-intervista (Daily.co + Whisper) **in beta — opzionale**

### Sprint 5 (settimana 9+, post-lancio): iterazione data-driven
- Monitorare le 5 metriche
- Aggiustare prezzi dal pannello
- Attivare Onfido quando volume ~200/mese
- Espandere pool domande
- Preparare modulo Housing per settembre 2026 (separato)

---

## 16. Cosa NON fare (regole hard)

1. **Mai chiamare Anthropic dal frontend.** Sempre API route server-side.
2. **Mai prezzi hardcoded.** Sempre da `pricing_plans`.
3. **Mai feature attive senza flag.** Tutto dietro `feature_flags`.
4. **Mai blockchain ora.** Q4 2026 con flag spento, claim pubblica = *"in development Q4 2026"*.
5. **Mai saltare Step 7 umano.** Principio strutturale.
6. **Mai velocità di scrittura come scoring.** AI Act + Dir. 2000/78.
7. **Mai analisi biometrica/espressioni/sguardo.** AI Act Art. 5(1)(f).
8. **Mai assumere Next.js < 16.** Leggere docs nel `node_modules`.
9. **Mai "Università del Lavoro" in materiali pubblici/codice.** Sistema = **WGP One**.
10. **Mai connessione diretta TGSS/INPS senza accordo istituzionale.** L'utente scarica e carica.
11. **Mai foto come fattore di scoring.** Solo opzionale presentazione, mai penalità.
12. **Mai promettere "tutela del lavoratore" sulla home pubblica Fase A.** Quella è Fase B con sindacati/ispettorati. Sulla home si dice solo "verifica professionale".
13. **Mai aprire Housing prima di settembre 2026.** Schema c'è, UI dice "coming soon".
14. **Mai pubblicare 6 dimensioni.** Solo Professional al lancio.

---

## 17. Decisioni rimandate (non bloccanti per il lancio)

Queste cose vanno decise nelle prossime settimane ma non bloccano l'avvio della build:

- Pricing finale (oggi sono ipotesi, si aggiusteranno sui dati)
- Provider pagamenti definitivo (Stripe consigliato, alternative valutabili)
- Provider Step 0 enhanced (Onfido/Veriff/Sumsub — paragonare costi)
- Quantità esatta pool domande al lancio (500 è target, accettabile 300-700)
- Logo finale (esistono varianti — usare il monogram navy 1024 in cartella brand)

---

## 18. Riferimenti rapidi

- **Domini live:** workingglobalpass.org, .com, workingpass.org
- **Demo matcher esistente:** wgp-matcher.vercel.app — GitHub `Workingglobalpass/wgp-matcher`
- **Trademark:** EUIPO 019351983, opposizione fino 06/08/2026
- **Entità:** WORKINGGLOBALPASS TECH S.L.U., Carrer de ses Parres 9, 07760 Ciutadella
- **Avvocato:** David Mülchi (dmulchi.com)
- **GDPR provider:** Pau di Conversia
- **LinkedIn:** linkedin.com/company/workingglobalpass

---

## 19. Documenti di riferimento

- `WGP_Vision_Completa_2026-2028.md` — visione strategica completa (4 lati: lavoratori + datori + alloggi + comunità), pitch istituzionali, roadmap Fase B
- `WGP_Architettura_Universita_del_Lavoro.docx` — fonte autoritativa 7 step + badge EQF
- `WGP_Trust_Levels_IT.docx` — Trust Levels Basic/Pro/Expert/Trusted
- `WGP_Master_Backup_Completo.docx` — stato consolidato 17/05/2026

---

## 20. Note finali per Claude Code

**Prima di scrivere codice:**
1. Leggere questo intero brief
2. Confermare i 14 punti di §16 ("Cosa NON fare")
3. Proporre Sprint 1 con: schema Supabase iniziale, struttura cartelle, landing page con palette navy fintech

**Durante la build:**
- Privilegia semplicità > eleganza
- Commenti `// IMPORTANT:` su ogni decisione legata a compliance (vedi esempio §6.6)
- Ogni feature dietro flag DB
- Ogni prezzo da DB
- Audit log su ogni mutation sensibile

**Filosofia di questo MVP:**
> *Codice pulito, ma non sacro. Scritto per essere abbandonato quando arriverà il CTO. Funzionale, leggibile, ispezionabile. Per validare il modello, non per durare 10 anni.*

L'infrastruttura definitiva la costruirà chi viene dopo, sui dati che questo MVP avrà raccolto.
