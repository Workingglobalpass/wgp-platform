/**
 * Supabase clients — server side (App Router / Route Handlers / Server Actions).
 *
 * Due client distinti:
 * 1. `getSupabaseServer()`  — usa cookies della sessione utente (rispetta RLS).
 * 2. `getSupabaseAdmin()`   — usa la service role key. BYPASSA RLS. Usare SOLO per:
 *    - operazioni di sistema (es. audit cleanup, badge issuance automatica)
 *    - admin tools dietro autenticazione e ruolo verificato server-side
 *
 * MAI esportare la service role key al client. Brief §16.1.
 * Next.js 16: `cookies()` è async → `await cookies()`.
 */
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

export async function getSupabaseServer() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error('[supabase/server] env Supabase mancanti.');
  }
  return createServerClient<Database>(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // chiamato da un Server Component: cookies read-only. OK ignorare:
          // il middleware si occuperà di refresh.
        }
      },
    },
  });
}

let _admin: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseAdmin() {
  if (_admin) return _admin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      '[supabase/admin] SUPABASE_SERVICE_ROLE_KEY mancante. ' +
        'NON usare lato browser. Solo Route Handlers / Server Actions.'
    );
  }
  _admin = createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return _admin;
}
