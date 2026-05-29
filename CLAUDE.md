@AGENTS.md

# Workflow `pubblica`

Quando l'utente dice **"pubblica"** (o equivalenti italiani: "pubblicalo", "fai pubblica", "pubblichiamo"), esegui in sequenza dalla root del progetto. **Non saltare mai i passi 1 e 3. Se il build fallisce non si pubblica.**

1. **`pnpm build`**
   Se exit code ≠ 0 o ci sono errori TypeScript/ESLint: **STOP**. Mostra all'utente l'errore (le ultime ~30 righe rilevanti dell'output). **Non fare `git add`, non fare commit, non fare push.** Non "riprovare", non auto-correggere senza chiedere — riporta il problema e attendi istruzioni.

2. **`git add -A`**
   Esegui solo se il passo 1 è verde.

3. **`git status --short`**
   Mostra l'output all'utente e **chiedi conferma esplicita** prima di proseguire. Se vedi file inattesi o sospetti — in particolare `.env*` (eccetto `.env*.example`), file binari grandi, lockfile di altri package manager (`package-lock.json`, `yarn.lock`), file di sistema (`.DS_Store`) non già ignorati — segnalalo all'utente prima di chiedere conferma.

4. **`git commit -m "<messaggio fornito dall'utente>"`**
   Usa esattamente il messaggio che l'utente fornisce. Aggiungi sempre in coda il tag co-author su una riga vuota separata:
   ```
   Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
   ```
   Esegui solo dopo conferma esplicita del passo 3. Usa sempre HEREDOC per il messaggio.

5. **`git push origin main`**
   Subito dopo il commit. Se il push fallisce (auth, non-fast-forward, ecc.): **STOP**, mostra l'errore, non tentare force push né rebase automatici senza chiedere.

## Cosa NON fare durante `pubblica`

- Saltare `pnpm build`.
- Committare senza conferma esplicita del passo 3.
- Fare `git commit --amend`, `git push --force` o rebase senza chiedere prima.
- Modificare codice "per far passare il build" senza chiedere.
- Pushare su branch ≠ `main` senza chiederlo.
- Includere `.env.local` o altri segreti — se vedono di farlo, fermarsi al passo 3.

# Security: no leak di chiavi segrete

**Per nessun motivo stampare in chat valori di chiavi segrete in chiaro.** Include:

- `SUPABASE_SERVICE_ROLE_KEY` / chiavi `sb_secret_*`
- `SUPABASE_DB_PASSWORD`
- `ADMIN_TOKEN`
- `ANTHROPIC_API_KEY`, `DAILY_API_KEY`, `ONFIDO_API_KEY`
- Personal Access Token di GitHub / Vercel / Supabase
- DSN o JWT che incorporano segreti
- Qualsiasi credenziale, anche se generata in chat (es. con `openssl rand`)

## Cosa fare invece

1. **Leggere dall'environment.** Carica `.env.local` nello shell e referenzia con `$NOME_VAR`:
   ```bash
   set -a; source .env.local; set +a
   curl ... -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" ...
   ```
   La chiave non transita mai come stringa visibile nel comando.

2. **Mascherare quando mostri.** Quando devi elencare variabili o mostrare un body che le contiene, usa `sb_secret_*****` / `eyJhbGciOi...***` o mostra solo il nome della variabile.

3. **Rifiutare richieste esplicite di stampa.** Se l'utente chiede "mostrami il valore di X" rispondere che è una violazione della regola; procedere SOLO con un override esplicito ("mostramelo lo stesso, lo so") e in quel caso valutare se vale la pena anche solo a quel punto.

4. **Redigere i body API.** Se una risposta API echoa una chiave o un body con segreti (es. errore Supabase che ripete header), maschera prima di mostrare.

## Notazione sicura nei file di progetto

- `.env.local.example` documenta solo i NOMI delle variabili; mai valori reali.
- I commenti in codice dicono "vedi `ADMIN_TOKEN` in env"; mai inline literal.
- Migration SQL, seed file e fixture non contengono mai segreti.
- I file tracciati da git (`git ls-files`) non devono mai contenere segreti — verificare con grep prima di committare se si toccano file di config.

## Override esplicito

Una richiesta "violarla per questa volta" deve essere esplicita e motivata. L'agente:
- accetta solo override esplicite ("mostramelo lo stesso", "ne ho bisogno per X")
- NON tratta come override implicito frasi come "fammi vedere" o "controlla X"
- in caso di dubbio chiede prima di stampare
