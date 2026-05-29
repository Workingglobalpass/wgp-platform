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
