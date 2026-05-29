/**
 * Supabase client — browser side.
 *
 * Usa SOLO la anon key. Tutte le operazioni passano da RLS.
 * Per operazioni privilegiate (audit, admin) usare `server.ts` con service role.
 *
 * Brief AGENTS.md §9, §16.1.
 */
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

let _client: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function getSupabaseBrowser() {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    throw new Error(
      '[supabase/client] NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY mancante. ' +
        'Controlla .env.local'
    );
  }

  _client = createBrowserClient<Database>(url, anon);
  return _client;
}
